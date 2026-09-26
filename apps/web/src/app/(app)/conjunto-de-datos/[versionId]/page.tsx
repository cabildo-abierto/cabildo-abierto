import {DatasetPage} from '@/components/datasets/dataset-page';

export default async function Page({params}: {params: Promise<{versionId: string}>}) {
    const {versionId} = await params;
    return <DatasetPage versionId={versionId}/>;
}
