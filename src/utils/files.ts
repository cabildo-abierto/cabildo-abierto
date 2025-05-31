export type FilePayload = {base64: string, fileName: string}

export async function file2base64(file: File): Promise<FilePayload> {
    const buffer = await file.arrayBuffer()

    const base64Data = Buffer.from(buffer).toString("base64")
    const mimeType = file.type

    if (base64Data.startsWith("data:")) {
        return {
            fileName: file.name,
            base64: base64Data
        };
    }

    return {
        fileName: file.name,
        base64: `data:${mimeType};base64,${base64Data}`
    }
}