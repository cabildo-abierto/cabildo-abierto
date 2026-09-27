import {TopicFootnoteContent} from "./topic-footnote-content";
import type {TopicFootnote} from "@/components/rich-text/topic-footnotes";
import {cn} from "@/lib/utils";
import {FootnoteLink} from "./footnote-link";

export function TopicFootnoteList({footnotes}: {footnotes: TopicFootnote[]}) {
    if (footnotes.length === 0) return null;
    return <section className={cn("mt-6 space-y-3 border-t pt-3")} aria-label="Referencias">
        <h2 className={cn("flex min-h-7 items-center text-xs font-medium text-muted-foreground")}>Referencias</h2>
        <ol className="space-y-2 text-xs text-muted-foreground">
            {footnotes.map(note => <li key={note.id} id={`footnote-${note.id}`} className="flex gap-2">
                <FootnoteLink href={`#footnote-ref-${note.id}`} className={cn("shrink-0 font-medium text-foreground hover:underline")}>{note.number}.</FootnoteLink>
                <TopicFootnoteContent note={note}/>
            </li>)}
        </ol>
    </section>;
}
