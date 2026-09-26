import {DocumentLink} from "./document-link";
import {FileTextIcon} from "@phosphor-icons/react";
import type {TopicBlock} from "@cabildo-abierto/api";
import {parseDocumentBlock} from "@cabildo-abierto/utils";
import {cn} from "@/lib/utils";

export function DocumentCard({block, linksEnabled = true}: {block: TopicBlock; linksEnabled?: boolean}) {
    const document = parseDocumentBlock(block.content);
    const content = <>
        <FileTextIcon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0 text-muted-foreground")}/>
        <div className={cn("min-w-0 flex-1")}>
            <span className={cn("block text-sm font-medium leading-relaxed break-words", linksEnabled && "group-hover/document:underline underline-offset-4")}>{document?.title ?? "Documento"}</span>
            {document?.description && <p className={cn("mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground break-words")}>{document.description}</p>}
        </div>
    </>;
    const className = cn("group/document -mx-2 flex items-start gap-2 rounded-md px-2 py-1", linksEnabled && "transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30");
    return linksEnabled && document ? <DocumentLink block={block} title={document.title} className={className}>{content}</DocumentLink>
        : <div className={className}>{content}</div>;
}
