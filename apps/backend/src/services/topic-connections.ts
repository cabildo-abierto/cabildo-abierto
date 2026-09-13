import {randomUUID} from "node:crypto";
import type {Response} from "express";
import {Client} from "pg";
import {sql, type Kysely} from "kysely";
import type {TopicConnectionCounts, TopicConnectionMode, TopicConnectionsChangedEvent} from "@cabildo-abierto/api";
import type {DB} from "#/db/types.js";
import type {Logger} from "#/utils/logger.js";

const NOTIFICATION_CHANNEL = "topic_connections";
const HEARTBEAT_INTERVAL_MS = 15_000;
const LEASE_REFRESH_INTERVAL_MS = 20_000;
const LEASE_DURATION_MS = 60_000;
const LISTENER_RECONNECT_DELAY_MS = 2_000;

type LocalConnection = {
    topicId: string;
    response: Response;
};

export class TopicConnections {
    private readonly connections = new Map<string, LocalConnection>();
    private listener: Client | null = null;
    private heartbeatTimer: NodeJS.Timeout | null = null;
    private leaseTimer: NodeJS.Timeout | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private closing = false;

    constructor(
        private readonly database: Kysely<DB>,
        private readonly databaseUrl: string,
        private readonly logger: Logger,
    ) {}

    async start(): Promise<void> {
        await this.connectListener();
        this.heartbeatTimer = setInterval(() => this.sendHeartbeats(), HEARTBEAT_INTERVAL_MS);
        this.leaseTimer = setInterval(() => void this.refreshLeases(), LEASE_REFRESH_INTERVAL_MS);
        this.heartbeatTimer.unref();
        this.leaseTimer.unref();
        await this.removeExpiredConnections();
    }

    async add(topicId: string, viewerId: string, mode: TopicConnectionMode, response: Response): Promise<() => void> {
        const connectionId = randomUUID();
        await this.database.insertInto("topic_connection").values({
            connection_id: connectionId,
            topic_id: topicId,
            viewer_id: viewerId,
            mode,
            expires_at: this.leaseExpiration(),
        }).execute();

        this.connections.set(connectionId, {topicId, response});
        await this.sendTopicSnapshot(topicId, response);
        await this.notifyTopic(topicId);

        let disconnected = false;
        return () => {
            if (disconnected) return;
            disconnected = true;
            void this.remove(connectionId);
        };
    }

    async close(): Promise<void> {
        this.closing = true;
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        if (this.leaseTimer) clearInterval(this.leaseTimer);
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

        const connectionIds = [...this.connections.keys()];
        const localConnections = [...this.connections.values()];
        const topicIds = new Set(localConnections.map(connection => connection.topicId));
        this.connections.clear();
        for (const connection of localConnections) connection.response.end();
        if (connectionIds.length > 0) {
            await this.database.deleteFrom("topic_connection").where("connection_id", "in", connectionIds).execute();
            await Promise.all([...topicIds].map(topicId => this.notifyTopic(topicId)));
        }
        await this.listener?.end().catch(() => undefined);
        this.listener = null;
    }

    private async connectListener(): Promise<void> {
        const listener = new Client({connectionString: this.databaseUrl});
        listener.on("notification", notification => {
            if (!notification.payload) return;
            try {
                const payload = JSON.parse(notification.payload) as {topicId?: unknown};
                if (typeof payload.topicId === "string") {
                    void this.broadcastTopic(payload.topicId).catch(error => {
                        this.logger.pino.error({error, topicId: payload.topicId}, "could not broadcast topic connections");
                    });
                }
            } catch (error) {
                this.logger.pino.warn({error}, "invalid topic connection notification");
            }
        });
        listener.on("error", error => {
            this.logger.pino.error({error}, "topic connection listener failed");
            if (this.listener === listener) this.listener = null;
            this.scheduleListenerReconnect();
        });
        listener.on("end", () => {
            if (this.listener !== listener) return;
            this.listener = null;
            this.scheduleListenerReconnect();
        });
        await listener.connect();
        await listener.query(`LISTEN ${NOTIFICATION_CHANNEL}`);
        this.listener = listener;
    }

    private scheduleListenerReconnect(): void {
        if (this.closing || this.reconnectTimer) return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            void this.connectListener().catch(error => {
                this.logger.pino.error({error}, "could not reconnect topic connection listener");
                this.scheduleListenerReconnect();
            });
        }, LISTENER_RECONNECT_DELAY_MS);
        this.reconnectTimer.unref();
    }

    private async remove(connectionId: string): Promise<void> {
        const connection = this.connections.get(connectionId);
        if (!connection) return;
        this.connections.delete(connectionId);
        try {
            await this.database.deleteFrom("topic_connection").where("connection_id", "=", connectionId).execute();
            await this.notifyTopic(connection.topicId);
        } catch (error) {
            this.logger.pino.error({error, connectionId}, "could not remove topic connection");
        }
    }

    private async refreshLeases(): Promise<void> {
        const connectionIds = [...this.connections.keys()];
        try {
            if (connectionIds.length > 0) {
                await this.database.updateTable("topic_connection")
                    .set({expires_at: this.leaseExpiration()})
                    .where("connection_id", "in", connectionIds)
                    .execute();
            }
            await this.removeExpiredConnections();
        } catch (error) {
            this.logger.pino.error({error}, "could not refresh topic connection leases");
        }
    }

    private async removeExpiredConnections(): Promise<void> {
        const removed = await this.database.deleteFrom("topic_connection")
            .where("expires_at", "<=", new Date())
            .returning("topic_id")
            .execute();
        const topicIds = new Set(removed.map(connection => connection.topic_id));
        await Promise.all([...topicIds].map(topicId => this.notifyTopic(topicId)));
    }

    private async notifyTopic(topicId: string): Promise<void> {
        await sql`select pg_notify(${NOTIFICATION_CHANNEL}, ${JSON.stringify({topicId})})`.execute(this.database);
    }

    private async broadcastTopic(topicId: string): Promise<void> {
        const topicConnections = [...this.connections.values()].filter(connection => connection.topicId === topicId);
        if (topicConnections.length === 0) return;
        const counts = await this.getCounts(topicId);
        for (const connection of topicConnections) this.sendEvent(connection.response, topicId, counts);
    }

    private async sendTopicSnapshot(topicId: string, response: Response): Promise<void> {
        this.sendEvent(response, topicId, await this.getCounts(topicId));
    }

    private async getCounts(topicId: string): Promise<TopicConnectionCounts> {
        const activeConnections = await this.database.selectFrom("topic_connection")
            .select(["viewer_id", "mode"])
            .where("topic_id", "=", topicId)
            .where("expires_at", ">", new Date())
            .execute();
        const modesByViewer = new Map<string, TopicConnectionMode>();
        for (const connection of activeConnections) {
            if (connection.mode !== "reading" && connection.mode !== "editing") continue;
            const currentMode = modesByViewer.get(connection.viewer_id);
            if (currentMode !== "editing") modesByViewer.set(connection.viewer_id, connection.mode);
        }
        let reading = 0;
        let editing = 0;
        for (const mode of modesByViewer.values()) {
            if (mode === "editing") editing += 1;
            else reading += 1;
        }
        return {reading, editing};
    }

    private sendEvent(response: Response, topicId: string, connections: TopicConnectionCounts): void {
        const event: TopicConnectionsChangedEvent = {type: "connections.changed", topicId, connections};
        response.write(`event: connections.changed\ndata: ${JSON.stringify(event)}\n\n`);
    }

    private sendHeartbeats(): void {
        for (const connection of this.connections.values()) connection.response.write(": heartbeat\n\n");
    }

    private leaseExpiration(): Date {
        return new Date(Date.now() + LEASE_DURATION_MS);
    }
}
