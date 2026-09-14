import type {TopicFootnote} from "@/components/rich-text/topic-footnotes";

export function TopicFootnoteList({footnotes}: {footnotes: TopicFootnote[]}) {
    if (footnotes.length === 0) return null;
    return <section className="mt-6 border-t pt-3" aria-label="Notas al pie">
        <ol className="space-y-2 text-xs text-muted-foreground">
            {footnotes.map(note => <li key={note.id} id={`footnote-${note.id}`} className="flex gap-2">
                <a href={`#footnote-ref-${note.id}`} className="shrink-0 font-medium text-foreground hover:underline">{note.number}.</a>
                <span className="whitespace-pre-wrap">{note.content}</span>
            </li>)}
        </ol>
    </section>;
}
