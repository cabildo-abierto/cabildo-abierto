import {useAPI} from "@/components/utils/react/queries";

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