import {TextWithLinks} from "@/components/ui/text-with-links";
import {DownloadSimpleIcon, FileTextIcon} from "@phosphor-icons/react";
import {BackToTopicButton} from "@/components/back-to-topic-button";
import type {DocumentOutput} from "@cabildo-abierto/api";
import {Button} from "@/components/ui/button";
import {backendUrl} from "@/lib/fetch";
import {cn} from "@/lib/utils";
import {documentFormatNames} from "@/lib/document-display";

export function DocumentPageHeader({document}: {document: DocumentOutput}) {
    const size = document.size < 1024 * 1024
        ? `${Math.ceil(document.size / 1024)} KB`
        : `${(document.size / (1024 * 1024)).toLocaleString("es-AR", {maximumFractionDigits: 1})} MB`;
    return <header className={cn("shrink-0 space-y-4 border-b pb-4")}>
        <BackToTopicButton href={`/tema/${encodeURIComponent(document.topic.slug)}`}/>
        <div className={cn("space-y-2")}>
            <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground")}><FileTextIcon aria-hidden="true" className={cn("size-3.5")}/><span>Documento · {documentFormatNames[document.format]}</span></div>
            <h1 className={cn("text-2xl font-semibold tracking-tight break-words")}>{document.title}</h1>
            {document.description && <p className={cn("whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground")}><TextWithLinks text={document.description}/></p>}
        </div>
        <div className={cn("flex flex-wrap items-center justify-between gap-2")}>
            <p className={cn("min-w-0 text-xs text-muted-foreground break-all")}>{document.fileName} <span className={cn("whitespace-nowrap")}>· {size}</span></p>
            <Button nativeButton={false} render={<a href={`${backendUrl}/documents/${document.id}/file`}/>} variant="outline" size="sm"><DownloadSimpleIcon/>Descargar</Button>
        </div>
    </header>;
}
