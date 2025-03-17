


export function arraySum(a: any[]) {
    return a.reduce((acc, curr) => acc + curr, 0)
}


export function isPrefix(p: any[], q: any[]){
    if(p.length > q.length) return false
    return areArraysEqual(p, q.slice(0, p.length))
}

export function areArraysEqual(a: any[], b: any[]) {
    if (a.length != b.length) return false
    for (let i = 0; i < a.length; i++) {
        if (a[i] != b[i]) return false
    }
    return true
}

export const range = (n) => Array.from({length: n}, (_, i) => i);

export function max<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    return arr.reduce((max, current) => (current > max ? current : max));
}

export function makeMatrix(n: number, m: number, v: number){
    let M = new Array<Array<number>>(n)
    for(let i = 0; i < n; i++) M[i] = new Array<number>(m).fill(v)
    return M
}

export function countInArray<T>(a: T[], f: (v: T) => boolean): number{
    let c = 0
    a.forEach((v) => {
        if(f(v)) c ++
    })
    return c
}

export function inRange(i: number, n: number) {
    return i >= 0 && i < n
}

export function newestFirst(a: { createdAt?: Date, reason?: { createdAt: Date } }, b: {
    createdAt?: Date,
    reason?: { createdAt: Date }
}) {
    if (!a.createdAt || !b.createdAt) return 0
    const dateA = a.reason ? a.reason.createdAt : a.createdAt
    const dateB = b.reason ? b.reason.createdAt : b.createdAt
    return new Date(dateB).getTime() - new Date(dateA).getTime()
}

export function oldestFirst(a: { createdAt?: Date }, b: { createdAt?: Date }) {
    return -newestFirst(a, b)
}

export function listOrder(a: { score?: number[] }, b: { score?: number[] }) {
    if (!a.score || !b.score) return 0
    for (let i = 0; i < a.score.length; i++) {
        if (a.score[i] > b.score[i]) {
            return 1
        } else if (a.score[i] < b.score[i]) {
            return -1
        }
    }
    return 0
}

export function listOrderDesc(a: { score?: number[] }, b: { score?: number[] }) {

    return -listOrder(a, b)
}