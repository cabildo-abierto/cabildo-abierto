import {TextWithLinks} from "@/components/ui/text-with-links";
import {DatasetCardDetails} from "@/components/datasets/dataset-card-details";
import {DocumentLink} from "./document-link";
import type {TopicBlock} from "@cabildo-abierto/api";
import {parseDocumentBlock, parseDatasetBlock} from "@cabildo-abierto/utils";
import {cn} from "@/lib/utils";

export function DocumentCard({block, linksEnabled = true, refreshOnMount = true, preview = false}: {block: TopicBlock; linksEnabled?: boolean; refreshOnMount?: boolean; preview?: boolean}) {
    const dataset = block.typeId === "dataset";
    const datasetContent = dataset ? parseDatasetBlock(block.content) : null;
    const document = dataset ? datasetContent : parseDocumentBlock(block.content);
    const content = <>
        <div className={cn("min-w-0 flex-1")}>
            <span className={cn("block font-medium leading-relaxed break-words", preview ? "text-xs" : "text-sm", dataset && "line-clamp-2", linksEnabled && "group-hover/document:underline underline-offset-4")}>{document?.title ?? (dataset ? "Conjunto de datos" : "Documento")}</span>
            {document?.description && <p className={cn("mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground break-words", dataset && "line-clamp-3")}><TextWithLinks text={document.description} linksEnabled={linksEnabled}/></p>}
            {datasetContent && <DatasetCardDetails versionId={block.id} dataset={datasetContent} draft={!linksEnabled} refreshOnMount={refreshOnMount}/>}
        </div>
    </>;
    const className = cn("relative group/document -mx-2 flex items-start gap-2 rounded-md px-2 py-1", linksEnabled && "transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30");
    return <div className={className}>
        {linksEnabled && document && <DocumentLink block={block} title={document.title} className={cn("absolute inset-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30")}><span className={cn("sr-only")}>{document.title}</span></DocumentLink>}
        {content}
    </div>;
}
