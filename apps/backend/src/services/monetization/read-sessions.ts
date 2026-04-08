import {ReadChunks} from "#/services/monetization/read-tracking.js";


function joinReadChunks(a: ReadChunks, b: ReadChunks): ReadChunks {
    const m = new Map<number, number>()
    a.forEach(c => {
        m.set(c.chunk, c.duration + (m.get(c.chunk) ?? 0))
    })
    b.forEach(c => {
        m.set(c.chunk, c.duration + (m.get(c.chunk) ?? 0))
    })
    return Array.from(m.entries()).map(([k, v]) => ({chunk: k, duration: v}))
}

export const FULL_READ_DURATION = 25

export function joinManyChunks(chunks: ReadChunks[]): ReadChunks {
    return chunks.reduce((acc, c) => joinReadChunks(acc, c))
}

