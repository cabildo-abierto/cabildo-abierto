"use client";

import {createContext, useContext, type ReactNode} from "react";
import type {TopicBlock} from "@cabildo-abierto/api";

type FootnoteBlock = TopicBlock & {isNew?: boolean; deleted?: boolean};
const Context = createContext<{topicId: string; blocks: FootnoteBlock[]}>({topicId: "", blocks: []});

export function TopicFootnoteProvider({topicId, blocks, children}: {topicId: string; blocks: FootnoteBlock[]; children: ReactNode}) {
    return <Context.Provider value={{topicId, blocks: blocks.filter(block => !block.deleted)}}>{children}</Context.Provider>;
}

export function useFootnoteBlocks() {
    return useContext(Context);
}
