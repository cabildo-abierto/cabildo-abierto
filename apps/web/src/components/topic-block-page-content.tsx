"use client"

import {useTopicRoute} from "@/components/topic-route-provider";;

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import type {TopicBlock} from "@cabildo-abierto/api";
import {TopicBlockContent} from "@/components/topic-block-content";
import {TopicBlockTools} from "@/components/topic-block-tools";
import {TopicConvergenceNotice} from "@/components/topic-convergence-notice";
import {useTopicRealtimeChange} from "@/hooks/use-topic-realtime-change";
import {useTopicLocalConvergence} from "@/hooks/use-topic-local-convergence";
import {topicFootnotes} from "@/components/rich-text/topic-footnotes";
import {TopicFootnoteList} from "@/components/rich-text/topic-footnote-list";

export function TopicBlockPageContent({topicId, initialBlock, latestBlock, initialHistoryOpen}: {
    topicId: string;
    initialBlock: TopicBlock;
    latestBlock: TopicBlock | undefined;
    initialHistoryOpen: boolean;
}) {
    const {slug: topicSlug} = useTopicRoute();
    const router = useRouter();
    const [displayedBlock, setDisplayedBlock] = useState(initialBlock);
    const realtimeChange = useTopicRealtimeChange(topicId);
    const deletingVersion = useTopicLocalConvergence(topicId, blocks => {
        const block = blocks.find(block => block.blockNumber === displayedBlock.blockNumber);
        if (block) setDisplayedBlock(block);
        else router.replace(`/tema/${encodeURIComponent(topicSlug)}`);
    });

    useEffect(() => {
        if (latestBlock && realtimeChange?.source === "vote") {
            setDisplayedBlock(latestBlock);
            return;
        }
        if (latestBlock && latestBlock.commentCount !== displayedBlock.commentCount) {
            setDisplayedBlock(current => ({...current, commentCount: latestBlock.commentCount}));
        }
    }, [displayedBlock.commentCount, latestBlock, realtimeChange]);

    const convergenceChanged = !latestBlock || latestBlock.id !== displayedBlock.id;
    const {footnotes, numberById} = topicFootnotes([displayedBlock]);
    return <div className="min-w-0 space-y-3">
        {!deletingVersion && convergenceChanged && <TopicConvergenceNotice onUpdate={() => {
            if (!latestBlock) router.push(`/tema/${encodeURIComponent(topicSlug)}`);
            else setDisplayedBlock(latestBlock);
        }}/>} 
        <div>
            <article className="rounded-lg border bg-card px-4 py-3">
                <TopicBlockContent block={displayedBlock} footnoteNumbers={numberById}/>
                <TopicFootnoteList footnotes={footnotes}/>
            </article>
            <TopicBlockTools topicId={topicId} block={displayedBlock} pageLayout initialHistoryOpen={initialHistoryOpen}/>
        </div>
    </div>;
}
