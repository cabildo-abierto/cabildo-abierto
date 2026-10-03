export type Notification = {
    id: string;
    kind: "comment" | "reply" | "replica" | "rejection" | "positive_vote" | "edit";
    sourceId: string;
    actor: {id: string; username: string};
    topic: {id: string; title: string; slug: string};
    targetId: string;
    blockNumber: string | null;
    documentBlockId: string | null;
    targetDeleted: boolean;
    replicaToReplica: boolean;
    createdAt: string;
    readAt: string | null;
};

export type NotificationsOutput = {notifications: Notification[]; nextCursor: string | null; unreadCount: number};
export type NotificationCountOutput = {unreadCount: number};
