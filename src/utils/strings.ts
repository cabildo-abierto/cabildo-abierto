function removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function cleanText(s: string): string {
    if(!s) return s
    return removeAccents(s.toLowerCase())
}


export function pxToNumber(x: string | number): number {
    if (typeof x == "string") {
        return parseInt(x, 10)
    }
    return x
}