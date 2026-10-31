import {randomUUID} from "node:crypto";
import {Client} from "pg";
import {sql, type Kysely, type Transaction} from "kysely";
import type {TopicChangedEvent, TopicConnectionCounts, TopicConnectionMode, TopicConnectionOpenedEvent, TopicConnectionsChangedEvent} from "@cabildo-abierto/api";
import type {DB} from "#/db/types.js";
import type {Logger} from "#/utils/logger.js";
import {topicConnectionCounts} from './topics/connections.js';

type EventStreamResponse = {
    write(chunk: string): boolean;
    end(): unknown;
    once(event: string, listener: () => void): unknown;
    destroyed: boolean;
    writableEnded: boolean;
    socket: {destroyed: boolean} | null;
};

const NOTIFICATION_CHANNEL = "topic_realtime";
const HEARTBEAT_INTERVAL_MS = 15_000;
const LEASE_REFRESH_INTERVAL_MS = 20_000;
const LEASE_DURATION_MS = 60_000;
const LISTENER_RECONNECT_DELAY_MS = 2_000;

type LocalConnection = {
    topicId: string;
    viewerId: string;
    response: EventStreamResponse;
};

type InternalNotification = {
    type: "connections.changed" | "topic.changed";
    topicId: string;
    source?: TopicChangedEvent["source"];
};

export async function notifyTopicChanged(database: Kysely<DB> | Transaction<DB>, topicId: string, source: TopicChangedEvent["source"], logger?: Logger): Promise<void> {
    const notification: InternalNotification = {type: "topic.changed", topicId, source};
    try {
        await sql`select pg_notify(${NOTIFICATION_CHANNEL}, ${JSON.stringify(notification)})`.execute(database);
    } catch (error) {
        logger?.pino.error({error, topicId, channel: NOTIFICATION_CHANNEL}, "could not send postgres topic.changed notification");
    }
}

export class TopicConnections {
    private readonly connections = new Map<string, LocalConnection>();
    private readonly observers = new Map<EventStreamResponse, Set<string>>();
    private readonly pendingTopics = new Set<string>();
    private broadcasting: Promise<void> | null = null;
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

    async add(topicId: string, viewerId: string, mode: TopicConnectionMode, response: EventStreamResponse): Promise<() => void> {
        const connectionId = randomUUID();
        await this.database.insertInto("topic_connection").values({
            connection_id: connectionId,
            topic_id: topicId,
            viewer_id: viewerId,
            mode,
            expires_at: this.leaseExpiration(),
        }).execute();

        this.connections.set(connectionId, {topicId, viewerId, response});
        await this.sendTopicSnapshot(topicId, response);
        this.writeEvent(response, {type: "connection.opened", topicId, connectionId});
        await this.notifyTopic(topicId);

        let disconnected = false;
        const disconnect = () => {
            if (disconnected) return;
            disconnected = true;
            void this.remove(connectionId);
        };
        response.once("error", disconnect);
        return disconnect;
    }

    async disconnect(connectionId: string, topicId: string, viewerId: string): Promise<void> {
        const connection = this.connections.get(connectionId);
        if (connection && connection.topicId === topicId && connection.viewerId === viewerId) {
            await this.remove(connectionId);
            return;
        }
        const deleted = await this.database.deleteFrom("topic_connection")
            .where("connection_id", "=", connectionId)
            .where("topic_id", "=", topicId)
            .where("viewer_id", "=", viewerId)
            .executeTakeFirst();
        if (Number(deleted.numDeletedRows) > 0) await this.notifyTopic(topicId);
    }

    watch(topicIds: string[], response: EventStreamResponse): () => void {
        this.observers.set(response, new Set(topicIds));
        const unsubscribe = () => { this.observers.delete(response); };
        response.once('error', unsubscribe);
        void this.broadcastConnections(topicIds).catch(error => {
            this.logger.pino.error({error}, 'could not send topic counter snapshot');
            unsubscribe();
            response.end();
        });
        return unsubscribe;
    }

    async close(): Promise<void> {
        this.closing = true;
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        if (this.leaseTimer) clearInterval(this.leaseTimer);
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

        const connectionIds = [...this.connections.keys()];
        const localConnections = [...this.connections.values()];
        const observers = [...this.observers.keys()];
        const topicIds = new Set(localConnections.map(connection => connection.topicId));
        this.connections.clear();
        this.observers.clear();
        for (const connection of localConnections) connection.response.end();
        for (const response of observers) response.end();
        await this.broadcasting?.catch(() => undefined);
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
                const payload = JSON.parse(notification.payload) as Partial<InternalNotification>;
                if (typeof payload.topicId === "string" && payload.type === "connections.changed") {
                    void this.broadcastConnections([payload.topicId]).catch(error => {
                        this.logger.pino.error({error, topicId: payload.topicId}, "could not broadcast topic connections");
                    });
                } else if (typeof payload.topicId === "string" && payload.type === "topic.changed" && payload.source) {
                    this.broadcastTopicChange(payload.topicId, payload.source);
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
        const topicIds = [...this.connections.values()].map(connection => connection.topicId);
        for (const ids of this.observers.values()) topicIds.push(...ids);
        void this.broadcastConnections(topicIds).catch(error => {
            this.logger.pino.error({error}, 'could not refresh topic counters after reconnect');
        });
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
        const notification: InternalNotification = {type: "connections.changed", topicId};
        await sql`select pg_notify(${NOTIFICATION_CHANNEL}, ${JSON.stringify(notification)})`.execute(this.database);
    }

    private broadcastConnections(topicIds: string[]): Promise<void> {
        for (const id of topicIds) this.pendingTopics.add(id);
        if (!this.broadcasting) {
            this.broadcasting = this.flushConnectionCounts().finally(() => {
                this.broadcasting = null;
                if (this.pendingTopics.size && !this.closing) {
                    void this.broadcastConnections([]).catch(error => {
                        this.logger.pino.error({error}, 'could not refresh pending topic counters');
                    });
                }
            });
        }
        return this.broadcasting;
    }

    private async flushConnectionCounts(): Promise<void> {
        // Serialize snapshots and updates so an older query cannot overwrite newer counts.
        while (this.pendingTopics.size && !this.closing) {
            const interested = new Set([...this.connections.values()].map(connection => connection.topicId));
            for (const ids of this.observers.values()) for (const id of ids) interested.add(id);
            const topicIds = [...this.pendingTopics].filter(id => interested.has(id));
            this.pendingTopics.clear();
            if (!topicIds.length) continue;
            const counts = await topicConnectionCounts(this.database, topicIds);
            for (const connection of this.connections.values()) {
                const count = counts.get(connection.topicId);
                if (count) this.sendEvent(connection.response, connection.topicId, count);
            }
            for (const [response, ids] of this.observers) {
                for (const id of topicIds) if (ids.has(id)) this.sendEvent(response, id, counts.get(id)!);
            }
        }
    }

    private broadcastTopicChange(topicId: string, source: TopicChangedEvent["source"]): void {
        const event: TopicChangedEvent = {type: "topic.changed", topicId, source};
        const recipients = [...this.connections.values()].filter(connection => connection.topicId === topicId);
        for (const connection of recipients) this.writeEvent(connection.response, event);
        for (const [response, ids] of this.observers) if (ids.has(topicId)) this.writeEvent(response, event);
    }

    private async sendTopicSnapshot(topicId: string, response: EventStreamResponse): Promise<void> {
        this.sendEvent(response, topicId, await this.getCounts(topicId));
    }

    private async getCounts(topicId: string): Promise<TopicConnectionCounts> {
        return (await topicConnectionCounts(this.database, [topicId])).get(topicId)!;
    }

    private sendEvent(response: EventStreamResponse, topicId: string, connections: TopicConnectionCounts): void {
        const event: TopicConnectionsChangedEvent = {type: "connections.changed", topicId, connections};
        this.writeEvent(response, event);
    }

    private writeEvent(response: EventStreamResponse, event: TopicConnectionsChangedEvent | TopicConnectionOpenedEvent | TopicChangedEvent): void {
        response.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
    }

    private sendHeartbeats(): void {
        for (const [connectionId, connection] of this.connections) {
            if (connection.response.destroyed || connection.response.writableEnded || connection.response.socket?.destroyed) {
                void this.remove(connectionId);
                continue;
            }
            connection.response.write(": heartbeat\n\n");
        }
        for (const response of this.observers.keys()) {
            if (response.destroyed || response.writableEnded || response.socket?.destroyed) this.observers.delete(response);
            else response.write(': heartbeat\n\n');
        }
    }

    private leaseExpiration(): Date {
        return new Date(Date.now() + LEASE_DURATION_MS);
    }
}
