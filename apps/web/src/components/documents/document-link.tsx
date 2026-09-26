"use client";

import {useRef, useState, type ReactNode} from "react";
import Link from "next/link";
import {Dialog} from "@base-ui/react/dialog";
import type {TopicBlock} from "@cabildo-abierto/api";
import {useIsMobile} from "@/hooks/use-is-mobile";
import {DocumentWindow} from "./document-window";

export function DocumentLink({block, title, className, children}: {
    block: TopicBlock; title: string; className: string; children: ReactNode;
}) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const linkRef = useRef<HTMLAnchorElement>(null);

    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Link ref={linkRef} href={`/documento/${encodeURIComponent(block.id)}`} className={className}
            aria-haspopup={isMobile === false ? "dialog" : undefined}
            onClick={event => {
                if (isMobile !== false || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                setOpen(true);
            }}>{children}</Link>
        <Dialog.Portal>
            <DocumentWindow block={block} title={title} returnFocus={linkRef}/>
        </Dialog.Portal>
    </Dialog.Root>;
}
