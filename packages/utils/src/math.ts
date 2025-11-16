

export function square(a: number){
    return a*a
}

export function dist(a: [number, number], b: [number, number]) {
    return Math.sqrt(square((a[0] - b[0])) + square((a[1] - b[1])))
}


export function inRange(a: number, l: number, r: number){
    return a >= l && a < r
}