"use client"

import {useState} from "react";

type BlockSection = "comments" | "history";
type OpenBlockSection = {blockNumber: string; section: BlockSection} | null;
export type TopicBlockSectionProps = {
    commentsOpen: boolean
    onCommentsOpenChange: (open: boolean) => void
    historyOpen: boolean
    onHistoryOpenChange: (open: boolean) => void
};

export function useTopicBlockSection() {
    const [openSection, setOpenSection] = useState<OpenBlockSection>(null);

    return (blockNumber: string): TopicBlockSectionProps => ({
        commentsOpen: openSection?.blockNumber === blockNumber && openSection.section === "comments",
        onCommentsOpenChange: (open: boolean) => setOpenSection(current => open
            ? {blockNumber, section: "comments"}
            : current?.blockNumber === blockNumber && current.section === "comments" ? null : current),
        historyOpen: openSection?.blockNumber === blockNumber && openSection.section === "history",
        onHistoryOpenChange: (open: boolean) => setOpenSection(current => open
            ? {blockNumber, section: "history"}
            : current?.blockNumber === blockNumber && current.section === "history" ? null : current),
    });
}
