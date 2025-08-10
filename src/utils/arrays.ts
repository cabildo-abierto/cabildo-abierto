

export function sortByKey<T, V>(a: T[], keyFn: (x: T) => V, keyCmp: (a: V, b: V) => number){
    function cmp(a: {x: T, key: V}, b: {x: T, key: V}) {
        return keyCmp(a.key, b.key)
    }

    return a.map(x => ({x, key: keyFn(x)})).sort(cmp).map(({x}) => x)
}


export function union<T>(s: Set<T>, t: Set<T>): Set<T> {
    const m = new Set<T>(s)
    t.forEach(x => {m.add(x)})
    return m
}

export function areSetsEqual<T>(a: Set<T>, b: Set<T>) {
    return areArraysEqual(Array.from(a), Array.from(b))
}

export function areArraysEqual(a: any[], b: any[]) {
    if (a.length != b.length) return false
    for (let i = 0; i < a.length; i++) {
        if (a[i] != b[i]) return false
    }
    return true
}

export function max<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    return arr.reduce((max, current) => (current > max ? current : max));
}

export function min<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    return arr.reduce((max, current) => (current < max ? current : max));
}

export function makeMatrix(n: number, m: number, v: number){
    let M = new Array<Array<number>>(n)
    for(let i = 0; i < n; i++) M[i] = new Array<number>(m).fill(v)
    return M
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

export function listOrder(a: number[], b: number[]) {
    if (!a || !b) return 0
    for (let i = 0; i < a.length; i++) {
        if (a[i] > b[i]) {
            return 1
        } else if (a[i] < b[i]) {
            return -1
        }
    }
    return 0
}

export function listOrderDesc(a: number[], b: number[]) {

    return -listOrder(a, b)
}


export function range(a: number, b?: number){
    if(b != undefined){
        return Array.from({ length: b-a }, (_, i) => a+i)
    }
    return Array.from({ length: a }, (_, i) => i)
}


export function gett<K, V>(map: Map<K, V>, key: K): V {
    const value = map.get(key);
    if (value === undefined) {
        throw new Error(`Key not found in map: ${String(key)}`)
    }
    return value;
}


export function sum<T>(a: T[], f: (x: T) => number): number {
    return a.reduce((acc, x) => acc+f(x), 0)
}

export function count<T>(a: T[], f: (x: T) => boolean): number {
    return sum(a, x => f(x) ? 1 : 0)
}


export const orderStrAsc = (a: string, b: string) => {
    return b > a ? 1 : -1
}

export const orderDateAsc = (a: Date, b: Date) => {
    return b.getTime() - a.getTime()
}

export const orderNumberAsc = (a: number, b: number) => {
    return b - a
}



export function unique<T, K>(list: T[], key?: (x: T) => K, removeNulls: boolean = false): T[]{
    if(key){
        const seen = new Set<K>()
        const unique: T[] = []
        list.forEach(x => {
            if(removeNulls && (x === null || x === undefined)) return
            const k = key(x)
            if(!seen.has(k)){
                unique.push(x)
                seen.add(k)
            }
        })
        return unique
    }

    return Array.from(new Set(list))
}