"use client";

import {useEffect, useState} from "react";
import type {TopicBlock} from "@cabildo-abierto/api";
import {TopicBlockView} from "@/components/topic-block";
import {TopicDeletedBlockItem, TopicDeletedBlocks} from "@/components/topic-deleted-blocks";
import {TopicConvergenceNotice} from "@/components/topic-convergence-notice";
import {sameConvergence, updateCommentCounts} from "@/components/topic-convergence";
import {useTopicRealtimeChange} from "@/hooks/use-topic-realtime-change";

export function TopicReadingContent({topicId, latestBlocks, latestDeletedBlocks, openToolsInPage}: {
    topicId: string;
    latestBlocks: TopicBlock[];
    latestDeletedBlocks: TopicBlock[];
    openToolsInPage: boolean;
}) {
    const [displayedBlocks, setDisplayedBlocks] = useState(latestBlocks);
    const [displayedDeletedBlocks, setDisplayedDeletedBlocks] = useState(latestDeletedBlocks);
    const [openCommentsBlockId, setOpenCommentsBlockId] = useState<string | null>(null);
    const [openHistoryBlockId, setOpenHistoryBlockId] = useState<string | null>(null);
    const [showDeleted, setShowDeleted] = useState(false);
    const realtimeChange = useTopicRealtimeChange(topicId);

    useEffect(() => {
        if (realtimeChange?.source === "vote") {
            setDisplayedBlocks(latestBlocks);
            setDisplayedDeletedBlocks(latestDeletedBlocks);
            return;
        }
        setDisplayedBlocks(current => updateCommentCounts(current, latestBlocks));
        setDisplayedDeletedBlocks(current => updateCommentCounts(current, latestDeletedBlocks));
    }, [latestBlocks, latestDeletedBlocks, realtimeChange]);

    const convergenceChanged = !sameConvergence(displayedBlocks, latestBlocks)
        || !sameConvergence(displayedDeletedBlocks, latestDeletedBlocks);
    const displayedBlockNumbers = new Set(displayedBlocks.map(block => block.blockNumber));
    const effectiveDeletedBlocks = displayedDeletedBlocks.filter(block => !displayedBlockNumbers.has(block.blockNumber));
    const displayedDeletedNumbers = new Set(effectiveDeletedBlocks.map(block => block.blockNumber));
    const blocksToRender = [...displayedBlocks, ...(showDeleted ? effectiveDeletedBlocks : [])]
        .sort((left, right) => left.order.localeCompare(right.order) || left.blockNumber.localeCompare(right.blockNumber));
    return <>
        {convergenceChanged && <TopicConvergenceNotice onUpdate={() => {
            setDisplayedBlocks(latestBlocks);
            setDisplayedDeletedBlocks(latestDeletedBlocks);
        }}/>}
        <TopicDeletedBlocks topicId={topicId} count={displayedDeletedBlocks.length} open={showDeleted} onToggle={() => setShowDeleted(value => !value)}/>
        {blocksToRender.length === 0
            ? <p className="py-2 text-sm text-muted-foreground">Este tema está vacío.</p>
            : <div>{blocksToRender.map(block => displayedDeletedNumbers.has(block.blockNumber)
                ? <TopicDeletedBlockItem key={block.blockNumber} topicId={topicId} block={block} openInPage={openToolsInPage}/>
                : <TopicBlockView
                    key={block.blockNumber}
                    topicId={topicId}
                    block={block}
                    openInPage={openToolsInPage}
                    commentsOpen={openCommentsBlockId === block.blockNumber}
                    onCommentsOpenChange={open => setOpenCommentsBlockId(open ? block.blockNumber : null)}
                    historyOpen={openHistoryBlockId === block.blockNumber}
                    onHistoryOpenChange={open => setOpenHistoryBlockId(open ? block.blockNumber : null)}
                    onSectionOpen={section => {
                        if (section === "comments") setOpenHistoryBlockId(null);
                        else setOpenCommentsBlockId(null);
                    }}
                />)}</div>}
    </>;
}
