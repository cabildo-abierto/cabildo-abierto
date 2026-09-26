"use client";

import {ArrowUpRightIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type {DocumentOutput} from "@cabildo-abierto/api";
import {topicFootnotes} from "@/components/rich-text/topic-footnotes";
import {TopicFootnoteList} from "@/components/rich-text/topic-footnote-list";
import {CADocumentBlock} from "./ca-document-block";
import {documentPreviewUrl} from "@/lib/document-display";
import {cn} from "@/lib/utils";

export function DocumentViewer({document, inWindow = false}: {document: DocumentOutput; inWindow?: boolean}) {
    if (document.format === 'ca') {
        const {footnotes, numberById} = topicFootnotes(document.blocks.map(block => ({...block, blockNumber: block.id, order: 'n'})));
        return <div>{document.blocks.map(block => <CADocumentBlock key={block.id} block={block} documentId={document.id} versionId={document.versionId} footnoteNumbers={numberById}/>)}
            <TopicFootnoteList footnotes={footnotes}/></div>;
    }
    if (document.format === 'text') return <pre className={cn("whitespace-pre-wrap break-words font-sans text-sm leading-relaxed")}>{document.text}</pre>;
    if (document.format === 'markdown') return <div className={cn("space-y-4 break-words text-sm leading-relaxed [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_table]:block [&_table]:overflow-auto [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_a]:underline")}>
        <Markdown remarkPlugins={[remarkGfm]} skipHtml components={{a: ({children, href}) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
            img: ({alt, src}) => <img src={src} alt={alt ?? ""} loading="lazy" referrerPolicy="no-referrer" className={cn("max-w-full rounded")}/>}}>{document.text}</Markdown>
    </div>;
    if (document.previewStatus !== 'ready') return <p className={cn("rounded-lg bg-muted p-4 text-sm")}>{document.previewError ?? 'La vista previa todavía no está disponible. Podés descargar el archivo original.'}</p>;
    const source = documentPreviewUrl(document.id);
    return <div className={cn(inWindow ? "flex min-h-64 flex-1 flex-col gap-2" : "space-y-2")}>
        <iframe src={source} title={document.title} className={cn("w-full rounded-md border bg-muted/20", inWindow ? "min-h-64 flex-1" : "h-[75dvh] min-h-80")}/>
        {!inWindow && <div className={cn("flex justify-end")}><Button nativeButton={false} render={<a href={source} target="_blank" rel="noopener noreferrer"/>} variant="ghost" size="sm"><ArrowUpRightIcon/>Abrir en otra pestaña</Button></div>}
    </div>;
}
