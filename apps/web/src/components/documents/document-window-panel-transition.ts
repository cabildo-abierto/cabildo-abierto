"use client";

import {useEffect, useState} from "react";
import {cn} from "@/lib/utils";

export function useDocumentWindowPanelVisibility(open: boolean): boolean {
    const [visible, setVisible] = useState(open);
    useEffect(() => {
        if (open) {
            setVisible(true);
            return;
        }
        const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 150 : 250;
        const timeout = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timeout);
    }, [open]);
    return open || visible;
}

export function documentWindowPanelAnimation(open: boolean): string {
    return cn("document-window-panel", open
        ? "document-window-panel-open"
        : "pointer-events-none document-window-panel-closed");
}
