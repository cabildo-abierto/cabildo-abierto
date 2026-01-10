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

export type EmailTemplate = {
    id: string
    name: string
    subject: string
    html: string
    text: string
    createdAt: string
    updatedAt: string
}

export type EmailTemplatesResponse = {
    templates: EmailTemplate[]
}

// Send emails types
export type SendEmailsTarget = "single" | "list" | "all_subscribers"

export type SendEmailsParams = {
    templateId: string
    target: SendEmailsTarget
    emails?: string[]  // Required for "single" and "list" targets
}

export type SendEmailResult = {
    email: string
    success: boolean
    error?: string
    emailSentId?: string
}

export type SendEmailsResponse = {
    results: SendEmailResult[]
    totalSent: number
    totalFailed: number
}

// SMTP2GO Stats types
export type SMTP2GOStatsResponse = {
    bounces: {
        total: number
        rejects: number
        softBounces: number
        hardBounces: number
        bouncePercent: number
    }
    spam: {
        total: number
        spamPercent: number
    }
    summary: {
        sent: number
        delivered: number
        deliveryRate: number
        opens: number
        clicks: number
        openRate: number
        clickRate: number
    }
    fetchedAt: string
}
