import {useAPI} from "@/queries/utils";

export type NextMeeting = {show: false} | {
    date: Date
    url: string
    show: true
    title: string
    description?: string
}

export const useNextMeeting = () => {
    return useAPI<NextMeeting>("/next-meeting", ["next-meeting"])
}