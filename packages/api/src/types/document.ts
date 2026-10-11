import type {TopicSummary} from "./topic";

export type DocumentFormat = "pdf" | "office" | "text" | "markdown" | "ca" | "html";
export type DocumentUploadOutput = {fileId: string; fileName: string; previewError: string | null};
export type DocumentImportOutput = DocumentUploadOutput & {format: DocumentFormat; sourceUrl: string};
export type DocumentOutput = {
    sourceUrl?: string | null;
    id: string;
    versionId: string;
    title: string;
    description: string;
    topic: TopicSummary;
    format: DocumentFormat;
    fileName: string;
    size: number;
    previewStatus: "ready" | "failed" | "pending";
    previewError: string | null;
    canRetry: boolean;
    text: string | null;
    blocks: Array<{id: string; typeId: "parrafo" | "h1" | "h2"; content: string; commentCount: number}>;
};
