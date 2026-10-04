"use client";

import {TopicFootnoteProvider} from "@/components/rich-text/topic-footnote-context";
import {TopicContentFlow} from '@/components/images/topic-content-flow';

import {compareContentBlocks, isAttachmentBlock} from "@cabildo-abierto/utils";
import {TopicAttachmentSection} from "@/components/attachments/topic-attachment-section";

import {useEffect, useState} from "react";
import type {TopicBlock, TopicEditableBlock, TopicReadingOutput} from "@cabildo-abierto/api";
import {cn} from "@/lib/utils";
import {TopicBlockView} from "@/components/topic-block";
import {TopicDeletedBlockItem, TopicDeletedBlocks} from "@/components/topic-deleted-blocks";
import {TopicConvergenceNotice} from "@/components/topic-convergence-notice";
import {sameConvergence, updateCommentCounts} from "@/components/topic-convergence";
import {useTopicRealtimeChange} from "@/hooks/use-topic-realtime-change";
import {useTopicLocalConvergence} from "@/hooks/use-topic-local-convergence";
import {useTopicBlockSection} from "@/hooks/use-topic-block-section";
import {topicFootnotes} from "@/components/rich-text/topic-footnotes";
import {TopicFootnoteList} from "@/components/rich-text/topic-footnote-list";

export function TopicReadingContent({topicId, latestBlocks, latestDeletedBlocks, attachments, openToolsInPage}: {
    topicId: string;
    latestBlocks: TopicBlock[];
    latestDeletedBlocks: TopicBlock[];
    attachments: TopicReadingOutput['attachments'];
    openToolsInPage: boolean;
}) {
    const [displayedBlocks, setDisplayedBlocks] = useState(latestBlocks);
    const [displayedDeletedBlocks, setDisplayedDeletedBlocks] = useState(latestDeletedBlocks);
    const [showDeleted, setShowDeleted] = useState(false);
    const realtimeChange = useTopicRealtimeChange(topicId);
    const blockSectionProps = useTopicBlockSection();
    const deletingVersion = useTopicLocalConvergence(topicId, blocks => {
        setDisplayedBlocks(blocks.filter(block => !block.deleted && !isAttachmentBlock(block.typeId)));
        setDisplayedDeletedBlocks(blocks.filter(block => block.deleted && !isAttachmentBlock(block.typeId)));
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
    const renderAttachment = (block: TopicEditableBlock) => block.deleted
        ? <TopicDeletedBlockItem key={block.blockNumber} topicId={topicId} block={block} openInPage={openToolsInPage} toolsProps={blockSectionProps(block.blockNumber)}/>
        : <TopicBlockView key={block.blockNumber} topicId={topicId} block={block} openInPage={openToolsInPage} {...blockSectionProps(block.blockNumber)}/>;
    return <TopicFootnoteProvider topicId={topicId} blocks={displayedBlocks}>
        {!deletingVersion && convergenceChanged && <TopicConvergenceNotice onUpdate={() => {
            setDisplayedBlocks(latestBlocks);
            setDisplayedDeletedBlocks(latestDeletedBlocks);
        }}/>}
        <TopicDeletedBlocks topicId={topicId} count={displayedDeletedBlocks.length + attachments.documento.deletedCount + attachments.dataset.deletedCount} open={showDeleted} onToggle={() => setShowDeleted(value => !value)}/>
        {blocksToRender.length === 0 && !Object.values(attachments).some(summary => summary.count + (showDeleted ? summary.deletedCount : 0) > 0)
            ? <p className="py-2 text-sm text-muted-foreground">Este tema está vacío.</p>
            : <TopicContentFlow>{blocksToRender.filter(block => !isAttachmentBlock(block.typeId)).map(block => displayedDeletedNumbers.has(block.blockNumber)
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
                <div className={cn("clear-both")}><TopicFootnoteList footnotes={footnotes}/></div>
                {(["documento", "dataset"] as const).map(type => {
                    const summary = attachments[type];
                    return summary.count + (showDeleted ? summary.deletedCount : 0) > 0 && <div key={type} className={cn("clear-both")}>
                        <TopicAttachmentSection dataset={type === "dataset"} topicId={topicId} summary={summary} includeDeleted={showDeleted} renderBlock={renderAttachment}/>
                    </div>;
                })}
                </TopicContentFlow>}
    </TopicFootnoteProvider>;
}
