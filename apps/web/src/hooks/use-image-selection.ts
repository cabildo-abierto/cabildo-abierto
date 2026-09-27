"use client";

import {useEffect, useRef, useState} from "react";

export function useImageSelection() {
    const ref = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState(false);

    useEffect(() => {
        const deselect = (event: PointerEvent) => {
            if (event.target instanceof Node && !ref.current?.contains(event.target)) setSelected(false);
        };
        document.addEventListener("pointerdown", deselect);
        return () => document.removeEventListener("pointerdown", deselect);
    }, []);

    return {ref, selected, select: () => setSelected(true)};
}
