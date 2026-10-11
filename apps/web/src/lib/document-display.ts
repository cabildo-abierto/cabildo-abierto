import {backendUrl} from "@/lib/fetch";

export const documentFormatNames = {pdf: "PDF", office: "Office", text: "Texto", markdown: "Markdown", ca: "CA", html: "Página web"};

export function documentPreviewUrl(documentId: string) {
    return `${backendUrl}/documents/${encodeURIComponent(documentId)}/file?preview=true`;
}
