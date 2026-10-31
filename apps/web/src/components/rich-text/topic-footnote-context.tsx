"use client";

import {createContext, useContext, type ReactNode} from "react";
import type {TopicBlock, TopicEditableBlock} from "@cabildo-abierto/api";

type FootnoteBlock = TopicBlock & {isNew?: boolean; deleted?: boolean};
const Context = createContext<{topicId: string; blocks: FootnoteBlock[]; deletedBlockNumbers: string[]; onSelectAttachment?: (block: TopicEditableBlock) => void}>({topicId: "", blocks: [], deletedBlockNumbers: []});

export function TopicFootnoteProvider({topicId, blocks, children, onSelectAttachment}: {topicId: string; blocks: FootnoteBlock[]; children: ReactNode; onSelectAttachment?: (block: TopicEditableBlock) => void}) {
    return <Context.Provider value={{topicId, blocks: blocks.filter(block => !block.deleted), deletedBlockNumbers: blocks.filter(block => block.deleted).map(block => block.blockNumber), onSelectAttachment}}>{children}</Context.Provider>;
}

export function useFootnoteBlocks() {
    return useContext(Context);
}
