import {AppContext} from "#/setup.js"
import {CAHandler} from "#/utils/handler.js"
import {SMTP2GOStatsResponse} from "@cabildo-abierto/api"

const SMTP2GO_API_URL = "https://api.smtp2go.com/v3"

type SMTP2GOBouncesResponse = {
    request_id: string
    data: {
        emails: number
        rejects: number
        softbounces: number
        hardbounces: number
        bounce_percent: string
    }
}

type SMTP2GOSpamResponse = {
    request_id: string
    data: {
        emails: number
        rejects: number
        spams: number
        spam_percent: string
    }
}

type SMTP2GOSummaryResponse = {
    request_id: string
    data: {
        cycle_start: string
        cycle_end: string
        cycle_used: number
        cycle_remaining: number
        cycle_max: number
        email_count: number
        bounce_rejects: number
        softbounces: number
        hardbounces: number
        bounce_percent: string
        spam_rejects: number
        spam_emails: number
        spam_percent: string
        unsubscribes: number
        unsubscribe_percent: string
        opens: number
        clicks: number
        rejects: number
    }
}

async function fetchSMTP2GO<T>(endpoint: string): Promise<T | null> {
    const apiKey = process.env.SMTP2GO_API_KEY
    if (!apiKey) {
        console.error("SMTP2GO_API_KEY not configured")
        return null
    }

    try {
        const response = await fetch(`${SMTP2GO_API_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Smtp2go-Api-Key": apiKey
            },
            body: JSON.stringify({})
        })

        if (!response.ok) {
            console.error(`SMTP2GO API error: ${response.status} ${response.statusText}`)
            return null
        }

        return await response.json() as T
    } catch (error) {
        console.error("SMTP2GO API fetch error:", error)
        return null
    }
}

export const getSMTP2GOStats: CAHandler<{}, SMTP2GOStatsResponse> = async (ctx, agent, params) => {
    // Fetch all stats in parallel
    const [bouncesRes, spamRes, summaryRes] = await Promise.all([
        fetchSMTP2GO<SMTP2GOBouncesResponse>("/stats/email_bounces"),
        fetchSMTP2GO<SMTP2GOSpamResponse>("/stats/email_spam"),
        fetchSMTP2GO<SMTP2GOSummaryResponse>("/stats/email_summary")
    ])

    // Check if API key is configured
    if (!process.env.SMTP2GO_API_KEY) {
        return {error: "SMTP2GO_API_KEY no está configurada"}
    }

    // Build response with available data
    const bounces = bouncesRes?.data ?? {
        emails: 0,
        rejects: 0,
        softbounces: 0,
        hardbounces: 0,
        bounce_percent: "0"
    }

    const spam = spamRes?.data ?? {
        emails: 0,
        spams: 0,
        spam_percent: "0"
    }

    const summary = summaryRes?.data ?? {
        email_count: 0,
        bounce_rejects: 0,
        softbounces: 0,
        hardbounces: 0,
        opens: 0,
        clicks: 0
    }

    // Calculate delivered = sent - all bounces
    const totalBounces = summary.bounce_rejects + summary.softbounces + summary.hardbounces
    const delivered = summary.email_count - totalBounces

    const deliveryRate = summary.email_count > 0 
        ? (delivered / summary.email_count) * 100 
        : 0

    const openRate = delivered > 0
        ? (summary.opens / delivered) * 100
        : 0

    const clickRate = summary.opens > 0
        ? (summary.clicks / summary.opens) * 100
        : 0

    return {
        data: {
            bounces: {
                total: bounces.emails,
                rejects: bounces.rejects,
                softBounces: bounces.softbounces,
                hardBounces: bounces.hardbounces,
                bouncePercent: parseFloat(bounces.bounce_percent) || 0
            },
            spam: {
                total: spam.spams,
                spamPercent: parseFloat(spam.spam_percent) || 0
            },
            summary: {
                sent: summary.email_count,
                delivered: delivered,
                deliveryRate: Math.round(deliveryRate * 100) / 100,
                opens: summary.opens,
                clicks: summary.clicks,
                openRate: Math.round(openRate * 100) / 100,
                clickRate: Math.round(clickRate * 100) / 100
            },
            fetchedAt: new Date().toISOString()
        }
    }
}

