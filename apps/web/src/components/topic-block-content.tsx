import {ImageBlock} from '@/components/images/image-block';
import {VisualizationBlock} from '@/components/visualizations/visualization-block';
import {isAttachmentBlock} from '@cabildo-abierto/utils';
import {DocumentCard} from "@/components/documents/document-card";
import type {TopicBlock} from "@cabildo-abierto/api";
import {RichTextRenderer} from "@/components/rich-text/rich-text-renderer";

export function TopicBlockContent({block, linksEnabled = true, showExternalLinkIcon, footnoteNumbers, refreshOnMount = true, preview = false}: {block: TopicBlock; linksEnabled?: boolean; showExternalLinkIcon?: boolean; footnoteNumbers?: ReadonlyMap<string, number>; refreshOnMount?: boolean; preview?: boolean}) {
    if (block.typeId === "imagen") return <ImageBlock block={block} preview={preview}/>;
    if (block.typeId === "visualizacion") return <VisualizationBlock block={block} refreshOnMount={refreshOnMount} preview={preview}/>;
    if (isAttachmentBlock(block.typeId)) return <DocumentCard block={block} linksEnabled={linksEnabled} refreshOnMount={refreshOnMount}/>;
    if (block.typeId === "h1") return <h2 className="text-xl font-semibold">{block.content}</h2>;
    if (block.typeId === "h2") return <h3 className="text-base font-semibold">{block.content}</h3>;
    return <p className="m-0 whitespace-pre-wrap p-0 text-sm leading-relaxed"><RichTextRenderer content={block.content} linksEnabled={linksEnabled} showExternalLinkIcon={showExternalLinkIcon} footnoteNumbers={footnoteNumbers}/></p>;
}
