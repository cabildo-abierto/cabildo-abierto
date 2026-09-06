"use client"

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";

const THEME_STORAGE_KEY = "theme";

export function ThemePicker() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    const toggleTheme = () => {
        const nextIsDark = !isDark;
        document.documentElement.classList.toggle("dark", nextIsDark);
        localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? "dark" : "light");
        setIsDark(nextIsDark);
    };

    const nextTheme = isDark ? "claro" : "oscuro";

    return <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        onClick={toggleTheme}
        aria-label={`Cambiar al tema ${nextTheme}`}
        aria-pressed={isDark}
        title={`Cambiar al tema ${nextTheme}`}
    >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
            <path d="M12 3v18"/>
            <path d="m12 9 4.65-4.65"/>
            <path d="m12 14.3 7.37-7.37"/>
            <path d="m12 19.6 8.85-8.85"/>
        </svg>
    </Button>;
}
