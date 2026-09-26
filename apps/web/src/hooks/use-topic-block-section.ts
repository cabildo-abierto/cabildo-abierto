"use client"

import {useState} from "react";

type BlockSection = "comments" | "history" | "sources";
type OpenBlockSection = {blockNumber: string; comments: boolean; history: boolean; sources: boolean} | null;
export type TopicBlockSectionProps = {
    sourcesOpen: boolean
    onSourcesOpenChange: (open: boolean) => void
    commentsOpen: boolean
    onCommentsOpenChange: (open: boolean) => void
    historyOpen: boolean
    onHistoryOpenChange: (open: boolean) => void
};

export function useTopicBlockSection() {
    const [openSection, setOpenSection] = useState<OpenBlockSection>(null);

    const setSectionOpen = (blockNumber: string, section: BlockSection, open: boolean) => {
        setOpenSection(current => {
            if (!open && current?.blockNumber !== blockNumber) return current;
            const next = {
                ...(current?.blockNumber === blockNumber ? current : {blockNumber, comments: false, history: false, sources: false}),
                [section]: open,
            };
            return next.comments || next.history || next.sources ? next : null;
        });
    };

    return (blockNumber: string): TopicBlockSectionProps => ({
        sourcesOpen: openSection?.blockNumber === blockNumber && openSection.sources,
        onSourcesOpenChange: open => setSectionOpen(blockNumber, "sources", open),
        commentsOpen: openSection?.blockNumber === blockNumber && openSection.comments,
        onCommentsOpenChange: open => setSectionOpen(blockNumber, "comments", open),
        historyOpen: openSection?.blockNumber === blockNumber && openSection.history,
        onHistoryOpenChange: open => setSectionOpen(blockNumber, "history", open),
    });
}
