"use client";

import type {ComponentProps} from "react";
import {smoothScrollTo} from "@/utils/react/scroll";

export function FootnoteLink({href, onClick, ...props}: ComponentProps<"a"> & {href: string}) {
    return <a {...props} href={href} onClick={event => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const destination = document.getElementById(href.slice(1));
        if (!destination) return;
        event.preventDefault();
        if (window.location.hash !== href) window.history.pushState(null, "", href);
        destination.getAnimations().filter(animation => animation.id === "footnote-highlight").forEach(animation => animation.cancel());
        smoothScrollTo(destination, 600, () => {
            if (!destination.isConnected) return;
            const originalColor = window.getComputedStyle(destination).color;
            const animation = destination.animate([
                {opacity: 1, color: originalColor, easing: "ease-in-out"},
                {opacity: 0.35, color: "#3b82f6", easing: "ease-in-out"},
                {opacity: 1, color: originalColor},
            ], {duration: 700, easing: "linear"});
            animation.id = "footnote-highlight";
        });
    }}/>;
}
