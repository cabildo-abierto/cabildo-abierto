"use client";

import {useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type RefObject} from 'react';
import {lccaDatasetReferences, type LccaDatasetReference} from '@/lib/lcca-dataset-references';

export type LccaDatasetHover = {reference: LccaDatasetReference; rect: DOMRect; query: string};

export function useLccaDatasetHover(query: string, highlighted: RefObject<HTMLPreElement | null>) {
    const references = useMemo(() => lccaDatasetReferences(query), [query]);
    const [hovered, setHovered] = useState<LccaDatasetHover | null>(null);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const keepOpen = useCallback(() => {
        if (timeout.current !== null) clearTimeout(timeout.current);
        timeout.current = null;
    }, []);
    const close = useCallback(() => {
        keepOpen();
        setHovered(null);
    }, [keepOpen]);
    const leave = useCallback(() => {
        keepOpen();
        timeout.current = setTimeout(() => {
            timeout.current = null;
            setHovered(null);
        }, 200);
    }, [keepOpen]);
    useEffect(() => {
        close();
        return keepOpen;
    }, [query, close, keepOpen]);

    const move = (event: PointerEvent<HTMLTextAreaElement>) => {
        if (event.pointerType === 'touch' || event.buttons) { close(); return; }
        const input = event.currentTarget;
        const bounds = input.getBoundingClientRect();
        const x = event.clientX, y = event.clientY;
        // Ignore borders, padding and scrollbars; spans can extend outside the clipped viewport.
        if (x < bounds.left + input.clientLeft || x >= bounds.left + input.clientLeft + input.clientWidth
            || y < bounds.top + input.clientTop || y >= bounds.top + input.clientTop + input.clientHeight) { leave(); return; }
        for (const span of highlighted.current?.querySelectorAll<HTMLElement>('[data-lcca-dataset]') ?? []) {
            for (const rect of span.getClientRects()) {
                if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) continue;
                const reference = references.find(candidate => candidate.start === Number(span.dataset.lccaDataset));
                if (!reference) continue;
                keepOpen();
                setHovered(current => current?.query === query && current.reference.start === reference.start
                    && current.rect.x === rect.x && current.rect.y === rect.y && current.rect.width === rect.width
                    ? current : {reference, rect, query});
                return;
            }
        }
        leave();
    };
    return {references, hovered: hovered?.query === query ? hovered : null, move, leave, close, keepOpen};
}
