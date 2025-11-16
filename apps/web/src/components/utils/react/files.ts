export type FilePayload = {base64: string, fileName: string}

export async function file2base64(file: File): Promise<FilePayload> {
    const buffer = await file.arrayBuffer();

    const base64Data = btoa(
        String.fromCharCode(...new Uint8Array(buffer))
    )

    const mimeType = file.type;

    return {
        fileName: file.name,
        base64: `data:${mimeType};base64,${base64Data}`,
    }
}