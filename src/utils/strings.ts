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


export function rounder(num: number): string {
    if (num >= 1000000) {
        return ((num / 1000000).toFixed(1)).toString() + " M"
    }
    if (num >= 10000) {
        return ((num / 1000).toFixed(1)).toString() + " mil"
    }
    else return num.toString()
}


export function prettyPrintJSON(obj: any): void {
    try {
        const prettyJSON = JSON.stringify(obj, null, 2); // 2-space indentation
        console.log(prettyJSON);
    } catch (error) {
        console.error("Failed to pretty print JSON:", error);
    }
}