"use client";

import {useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode} from "react";
import {cn} from "@/lib/utils";

export function TopicBlockPanel({history, comments, pageLayout, sources}: {
    history: ReactNode;
    comments: ReactNode;
    pageLayout: boolean;
    sources?: ReactNode;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [attachmentLeft, setAttachmentLeft] = useState<number>();
    const hasPanel = Boolean(sources || history || comments);
    const measure = useCallback(() => {
        const panel = panelRef.current;
        const grid = panel?.closest('[data-topic-attachment-grid]');
        const parent = panel?.offsetParent;
        setAttachmentLeft(grid && parent instanceof HTMLElement
            ? grid.getBoundingClientRect().right - parent.getBoundingClientRect().left
            : undefined);
    }, []);
    // A card can move between columns without changing its dimensions.
    useLayoutEffect(() => { if (hasPanel && !pageLayout) measure(); });
    useLayoutEffect(() => {
        if (!hasPanel || pageLayout) return;
        const panel = panelRef.current;
        const grid = panel?.closest('[data-topic-attachment-grid]');
        if (!grid) return;
        const observer = new ResizeObserver(measure);
        observer.observe(grid);
        if (panel?.offsetParent instanceof HTMLElement) observer.observe(panel.offsetParent);
        window.addEventListener('resize', measure);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [hasPanel, pageLayout, measure]);
    if (!hasPanel) return null;
    return <div ref={panelRef} style={attachmentLeft === undefined ? undefined : {'--topic-panel-left': `${attachmentLeft}px`} as CSSProperties}
        className={cn("mt-4 flex min-w-0 flex-col gap-4 [&>section]:my-0", !pageLayout && "2xl:absolute 2xl:top-0 2xl:left-[var(--topic-panel-left,100%)] 2xl:ml-32 2xl:mt-0 2xl:w-72")}>
        {sources}
        {history}
        {comments}
    </div>;
}
