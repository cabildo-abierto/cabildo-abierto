import type {ImageContent} from '@cabildo-abierto/api';
export function parseImageBlock(content: string): ImageContent | null {
    try {
        const value = JSON.parse(content);
        if (!value || typeof value !== 'object' || Array.isArray(value)
            || Object.keys(value).some(key => !['fileId','widthPercent','alignment','flow','alt','caption'].includes(key))
            || typeof value.fileId !== 'string' || !/^[0-9a-f-]{36}$/i.test(value.fileId)
            || typeof value.widthPercent !== 'number' || !Number.isFinite(value.widthPercent) || value.widthPercent < 10 || value.widthPercent > 100
            || !['left','center','right'].includes(value.alignment) || !['separate','wrap'].includes(value.flow)
            || (value.flow === 'wrap' && value.alignment === 'center')
            || typeof value.alt !== 'string' || value.alt.length > 1000
            || typeof value.caption !== 'string' || value.caption.length > 5000) return null;
        return {fileId:value.fileId,widthPercent:value.widthPercent,alignment:value.alignment,flow:value.flow,alt:value.alt,caption:value.caption};
    } catch { return null; }
}
