"use client"

import {useEffect, useState} from "react";

export function useMediaQuery(query: string) {
    const [matches, setMatches] = useState<boolean | null>(null);

    useEffect(() => {
        const media = window.matchMedia(query);
        const update = () => setMatches(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, [query]);

    return matches;
}
