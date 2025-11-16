"use client"
import dayjs from "dayjs";
import "dayjs/locale/es";
import {formatIsoDate} from "@cabildo-abierto/utils/dist";
import { useMemo } from "react";


export function localeDate(date: Date, includeCurrentYear: boolean=false, includeSeconds: boolean=false, includeHours: boolean=false, includeMinutes: boolean=false) {
    let dateFormat = dayjs(date).year() !== 2025 || includeCurrentYear
        ? "D [de] MMMM [de] YYYY"
        : "D [de] MMMM"

    if(includeSeconds){
        dateFormat = `${dateFormat}, HH:mm:ss`
    } else if(includeHours) {
        dateFormat = `${dateFormat}, h a`
    } else if(includeMinutes) {
        dateFormat = `${dateFormat}, HH:mm`
    }

    return dayjs(date).locale('es').format(dateFormat)
}


export const getFormattedTimeSince = (date: Date) => {
    const now = new Date()

    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) {
        return `${seconds} s`
    }

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
        return `${minutes} mins`
    }

    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
        return `${hours} h`
    }

    const days = Math.floor(hours / 24)
    if (days < 30) {
        return `${days} d`
    }

    const months = Math.floor(days / 30)
    if (months == 1){
        return `${months} mes`
    }

    if (months < 12) {
        return `${months} meses`
    }

    const years = Math.floor(days / 365)
    return `${years} a`
};


export function DateSince({ date, title=true }: { date: Date | string, title?: boolean}) {
    date = new Date(date)

    const timeSince = useMemo(() => {
        return getFormattedTimeSince(date)
    }, [])

    return <span
        title={title ? formatIsoDate(new Date(date), true) : undefined}
    >
        {timeSince}
    </span>
}