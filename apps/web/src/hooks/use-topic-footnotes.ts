"use client";

import {useMemo, useRef} from 'react';
import type {TopicBlock} from '@cabildo-abierto/api';
import {topicFootnotes, type TopicFootnoteCache} from '@/components/rich-text/topic-footnotes';

export function useStableFootnoteNumbers(numbers: ReadonlyMap<string, number>) {
    const previous = useRef(numbers);
    if (previous.current.size !== numbers.size || [...numbers].some(([id, number]) => previous.current.get(id) !== number)) {
        previous.current = numbers;
    }
    return previous.current;
}

export function useTopicFootnotes(blocks: (Pick<TopicBlock, 'typeId' | 'content'> & {deleted?: boolean})[]) {
    const cache = useRef<TopicFootnoteCache>(new WeakMap());
    const notes = useMemo(() => topicFootnotes(blocks.filter(block => !block.deleted), cache.current), [blocks]);
    const numberById = useStableFootnoteNumbers(notes.numberById);
    const signature = JSON.stringify(notes.footnotes);
    const previous = useRef({signature, notes: {...notes, numberById}});
    if (previous.current.signature !== signature) previous.current = {signature, notes: {...notes, numberById}};
    return previous.current.notes;
}
