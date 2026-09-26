"use client";

import {compareContentBlocks, isAttachmentBlock} from "@cabildo-abierto/utils";
import {DocumentSection} from "@/components/documents/document-section";

import {useEffect, useState} from "react";
import type {TopicBlock} from "@cabildo-abierto/api";
import {TopicBlockView} from "@/components/topic-block";
import {TopicDeletedBlockItem, TopicDeletedBlocks} from "@/components/topic-deleted-blocks";
import {TopicConvergenceNotice} from "@/components/topic-convergence-notice";
import {sameConvergence, updateCommentCounts} from "@/components/topic-convergence";
import {useTopicRealtimeChange} from "@/hooks/use-topic-realtime-change";
import {useTopicLocalConvergence} from "@/hooks/use-topic-local-convergence";
import {useTopicBlockSection} from "@/hooks/use-topic-block-section";
import {topicFootnotes} from "@/components/rich-text/topic-footnotes";
import {TopicFootnoteList} from "@/components/rich-text/topic-footnote-list";

export function TopicReadingContent({topicId, latestBlocks, latestDeletedBlocks, openToolsInPage}: {
    topicId: string;
    latestBlocks: TopicBlock[];
    latestDeletedBlocks: TopicBlock[];
    openToolsInPage: boolean;
}) {
    const [displayedBlocks, setDisplayedBlocks] = useState(latestBlocks);
    const [displayedDeletedBlocks, setDisplayedDeletedBlocks] = useState(latestDeletedBlocks);
    const [showDeleted, setShowDeleted] = useState(false);
    const realtimeChange = useTopicRealtimeChange(topicId);
    const blockSectionProps = useTopicBlockSection();
    const deletingVersion = useTopicLocalConvergence(topicId, blocks => {
        setDisplayedBlocks(blocks.filter(block => !block.deleted));
        setDisplayedDeletedBlocks(blocks.filter(block => block.deleted));
    });

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
        .sort(compareContentBlocks);
    const {footnotes, numberById} = topicFootnotes(displayedBlocks);
    return <>
        {!deletingVersion && convergenceChanged && <TopicConvergenceNotice onUpdate={() => {
            setDisplayedBlocks(latestBlocks);
            setDisplayedDeletedBlocks(latestDeletedBlocks);
        }}/>}
        <TopicDeletedBlocks topicId={topicId} count={displayedDeletedBlocks.length} open={showDeleted} onToggle={() => setShowDeleted(value => !value)}/>
        {blocksToRender.length === 0
            ? <p className="py-2 text-sm text-muted-foreground">Este tema está vacío.</p>
            : <div>{blocksToRender.filter(block => !isAttachmentBlock(block.typeId)).map(block => displayedDeletedNumbers.has(block.blockNumber)
                ? <TopicDeletedBlockItem key={block.blockNumber} topicId={topicId} block={block} openInPage={openToolsInPage}
                    toolsProps={blockSectionProps(block.blockNumber)}/>
                : <TopicBlockView
                    key={block.blockNumber}
                    topicId={topicId}
                    block={block}
                    footnoteNumbers={numberById}
                    openInPage={openToolsInPage}
                    {...blockSectionProps(block.blockNumber)}
                />)}
                {(["documento", "dataset"] as const).map(type => blocksToRender.some(block => block.typeId === type) && <DocumentSection key={type} dataset={type === "dataset"}>
                    {blocksToRender.filter(block => block.typeId === type).map(block => displayedDeletedNumbers.has(block.blockNumber)
                        ? <TopicDeletedBlockItem key={block.blockNumber} topicId={topicId} block={block} openInPage={openToolsInPage} toolsProps={blockSectionProps(block.blockNumber)}/>
                        : <TopicBlockView key={block.blockNumber} topicId={topicId} block={block} openInPage={openToolsInPage} {...blockSectionProps(block.blockNumber)}/>)}
                </DocumentSection>)}
                <TopicFootnoteList footnotes={footnotes}/></div>}
    </>;
}
