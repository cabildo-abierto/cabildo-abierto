

export type PendingModeration = {
    contents: {
        view: any | null
        uri: string | null
        id: string
    }[]
}