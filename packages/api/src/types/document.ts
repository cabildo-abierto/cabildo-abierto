import type {TopicSummary} from "./topic";

export type DocumentFormat = "pdf" | "office" | "text" | "markdown" | "ca";
export type DocumentUploadOutput = {fileId: string; fileName: string; previewError: string | null};
export type DocumentOutput = {
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
