import { ArCabildoabiertoActorDefs } from "../client"

export type StatsDashboard = {
    lastUsers: (ArCabildoabiertoActorDefs.ProfileViewBasic & { lastReadSession: Date | null, CAProfileCreatedAt?: Date })[]
    counts: {
        registered: number
        active: number
        verified: number
        verifiedActive: number
    }
    WAUPlot: { date: Date, count: number }[]
    usersPlot: { date: Date, count: number }[]
    WAUPlotVerified: { date: Date, count: number }[]
    articlesPlot: {date: Date, count: number}[]
    topicVersionsPlot: {date: Date, count: number}[]
    caCommentsPlot: {date: Date, count: number}[]
}