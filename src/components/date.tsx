"use client"
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

export function DateSince({ date }: { date: Date }) {
    const rtf = useMemo(
        () =>
            new Intl.RelativeTimeFormat('es', {
                localeMatcher: 'best fit',
                numeric: 'auto',
                style: 'short',
            }),
        [],
    );

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    console.log(seconds, minutes)
    const localeDate = seconds < 10 ? 'ahora' : rtf.format(-minutes, 'minute');
    
    return <>{localeDate}</>;
}

// Componente para mostrar la fecha y la hora
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