import {DatasetCardDetails} from "@/components/datasets/dataset-card-details";
import {DocumentLink} from "./document-link";
import type {TopicBlock} from "@cabildo-abierto/api";
import {parseDocumentBlock, parseDatasetBlock} from "@cabildo-abierto/utils";
import {cn} from "@/lib/utils";

export function DocumentCard({block, linksEnabled = true}: {block: TopicBlock; linksEnabled?: boolean}) {
    const dataset = block.typeId === "dataset";
    const datasetContent = dataset ? parseDatasetBlock(block.content) : null;
    const document = dataset ? datasetContent : parseDocumentBlock(block.content);
    const content = <>
        <div className={cn("min-w-0 flex-1")}>
            <span className={cn("block text-sm font-medium leading-relaxed break-words", linksEnabled && "group-hover/document:underline underline-offset-4")}>{document?.title ?? (dataset ? "Conjunto de datos" : "Documento")}</span>
            {document?.description && <p className={cn("mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground break-words")}>{document.description}</p>}
            {datasetContent && <DatasetCardDetails versionId={block.id} dataset={datasetContent} draft={!linksEnabled}/>}
        </div>
    </>;
    const className = cn("group/document -mx-2 flex items-start gap-2 rounded-md px-2 py-1", linksEnabled && "transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30");
    return linksEnabled && document ? <DocumentLink block={block} title={document.title} className={className}>{content}</DocumentLink>
        : <div className={className}>{content}</div>;
}
