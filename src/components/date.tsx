"use client"
import { useEffect, useState } from "react";


export function DateComponent({ date }) {
    const [localeDate, setLocaleDate] = useState('')

    useEffect(() => {
        setLocaleDate(date.toLocaleDateString());
    }, []);

    return <>{localeDate}</>
}


export function DateAndTimeComponent({ date }) {
    const [localeDate, setLocaleDate] = useState('')

    useEffect(() => {
        setLocaleDate(date.toLocaleString());
    }, []);

    return <>{localeDate}</>
}