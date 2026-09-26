import {DocumentPage} from "@/components/documents/document-page";

export default async function Page({params}: {params: Promise<{versionId: string}>}) {
    const {versionId} = await params;
    return <DocumentPage versionId={versionId}/>;
}
