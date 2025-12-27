export type MailSubscription = {
    email: string
    status: "Subscribed" | "Unsubscribed"
    subscribedAt: string
    updatedAt: string | null
    handle: string | null
    userId: string | null
    inCA: boolean | null
}

export type MailSubscriptionsResponse = {
    subscriptions: MailSubscription[]
    counts: {
        subscribed: number
        unsubscribed: number
        usersWithoutSubscription: number
    }
}

export type SentEmail = {
    id: string
    recipientEmail: string
    sentAt: string
    subject: string
    html: string
    text: string
    success: boolean
    templateName: string
}

export type SentEmailsResponse = {
    emailsByTemplate: Record<string, SentEmail[]>
    totalCount: number
}
