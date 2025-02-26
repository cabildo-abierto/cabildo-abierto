"use client"
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {formatDate} from "./utils";

// Componente para mostrar solo la fecha
export function DateComponent({ date }: { date: Date }) {
    const [localeDate, setLocaleDate] = useState('');

    useEffect(() => {
        if(date.getFullYear() != 2024)
            setLocaleDate(format(date, "dd 'de' MMMM", { locale: es }));
        else
            setLocaleDate(format(date, "dd 'de' MMMM 'de' yyyy", { locale: es }));
    }, [date]);

    return <>{localeDate}</>;
}

function localeDate(date: Date){
    if(date.getFullYear() != 2024)
        return format(date, "dd 'de' MMMM", { locale: es })
    else
        return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es })
}

export function DateSince({ date }: { date: string | Date}) {
    const rtf = useMemo(
        () =>
            new Intl.RelativeTimeFormat('es', {
                localeMatcher: 'best fit',
                numeric: 'auto',
                style: 'narrow',
            }),
        [],
    );

    const now = new Date();
    const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    const formatTime = () => {
        if (seconds < 60) {
            return rtf.format(-seconds, 'second');
        }
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return rtf.format(-minutes, 'minute');
        }
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return rtf.format(-hours, 'hour');
        }
        
        const days = Math.floor(hours / 24);
        if (days < 7) {
            return rtf.format(-days, 'day');
        }
        
        const weeks = Math.floor(days / 7);
        if (weeks < 4) {
            return rtf.format(-weeks, 'week');
        }
        
        const months = Math.floor(days / 30);
        if (months < 12) {
            return rtf.format(-months, 'month');
        }
        
        const years = Math.floor(days / 365);
        return rtf.format(-years, 'year');
    };

    return <span title={localeDate(new Date(date))}>
        {formatTime()}
    </span>;
}


export function DateAndTimeComponent({ date }: { date: Date }) {
    const [localeDate, setLocaleDate] = useState('');
    
    useEffect(() => {
        if(date.getFullYear() != 2024)
            setLocaleDate(format(date, "dd 'de' MMMM, HH:mm", { locale: es }));
        else
            setLocaleDate(format(date, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es }));
    }, [date]);

    return <>{localeDate}</>;
}