"use client"
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {formatIsoDate} from "@/utils/dates";


export function localeDate(date: Date, includeCurrentYear: boolean=false, includeSeconds: boolean=false) {
    let dateFormat = date.getFullYear() !== 2025 || includeCurrentYear
        ? "d 'de' MMMM 'de' yyyy"
        : "d 'de' MMMM"

    if(includeSeconds){
        dateFormat = `${format}, HH:mm:ss`
    }

    return format(date, dateFormat, { locale: es })
}

export function DateSince({ date }: { date: string | Date}) {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    const formatTime = () => {
        if (seconds < 60) {
            return `${seconds} s`
        }
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return `${minutes} m`
        }
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return `${hours} h`
        }
        
        const days = Math.floor(hours / 24);
        if (days < 30) {
            return `${days} d`
        }
        
        const months = Math.floor(days / 30);
        if (months == 1){
            return `${months} mes`
        }

        if (months < 12) {
            return `${months} meses`
        }
        
        const years = Math.floor(days / 365);
        return `${years} a`
    };

    return <span title={formatIsoDate(new Date(date), true)}>
        {formatTime()}
    </span>;
}