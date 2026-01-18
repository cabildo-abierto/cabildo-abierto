import {FilePayload} from "@cabildo-abierto/api";


export function file2base64(file: File): Promise<FilePayload> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
            resolve({
                fileName: file.name,
                base64: reader.result as string,
            })
        }

        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}