import {RefObject, useCallback, useEffect, useRef, useState} from "react";
import {post} from "@/utils/fetch";
import {splitUri} from "@/utils/uri";
import {usePathname, useSearchParams} from 'next/navigation'

type ReadChunks = {
    chunk: number
    duration: number
}[]

export async function sendReadChunks(uri: string, chunks: Map<number, number>, totalChunks: number) {
    const chunksPayload: ReadChunks = Array.from(chunks.entries()).map(([chunk, duration]) => ({
        chunk,
        duration
    }));

    const {did, collection, rkey} = splitUri(uri)
    try {
        await post(`/read-session/${did}/${collection}/${rkey}`, {chunks: chunksPayload, totalChunks})
    } catch (err) {
        console.error("Failed to send read chunks", err);
    }
}


const CHUNK_HEIGHT = 100; // px
const IDLE_TIMEOUT = 30000; // 60s
const FLUSH_INTERVAL = 15000 // 30s

type ReadEvent = {
    scrollY: number
    duration: number
}

export const useTrackReading = (
    uri: string,
    articleRef: RefObject<HTMLElement>,
    clippedToHeight: number | null,
    setReadChunks?: (r: Map<number, number>) => void,
) => {
    const readChunks = useRef<Map<number, number>>(new Map())
    const lastActivity = useRef(Date.now())
    const idle = useRef(false)
    const lastScroll = useRef<{ scrollY: number, timestamp: number }>({scrollY: 0, timestamp: Date.now()})
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [sentInitialView, setSentInitialView] = useState(false)

    const articleStart = articleRef.current?.offsetTop
    const articleEnd = articleRef.current?.offsetTop + articleRef.current?.offsetHeight
    const totalChunks = Math.ceil((articleEnd - articleStart) / CHUNK_HEIGHT)

    useEffect(() => {
        if(totalChunks != null){
            if(!sentInitialView){
                sendReadChunks(uri, new Map([[0, 0]]), totalChunks)
                setSentInitialView(true)
            }
        }
    }, [totalChunks, sentInitialView]);

    const updateActivity = () => {
        lastActivity.current = Date.now();
        idle.current = false;
    }

    const checkIdle = () => {
        if (Date.now() - lastActivity.current > IDLE_TIMEOUT) {
            idle.current = true
        }
    }

    const newReadEvent = useCallback((s: ReadEvent) => {
        const articleStart = articleRef.current?.offsetTop
        const articleEnd = articleRef.current?.offsetTop + articleRef.current?.offsetHeight
        const readSegmentStart = s.scrollY
        const readSegmentEnd = s.scrollY + window.innerHeight

        const firstChunk = Math.max(Math.floor((readSegmentStart - articleStart) / CHUNK_HEIGHT), 0)
        let lastChunk = Math.ceil((Math.min(readSegmentEnd, Math.min(articleEnd, articleStart + (clippedToHeight ?? Infinity))) - articleStart) / CHUNK_HEIGHT)
        lastChunk = Math.min(lastChunk, totalChunks)
        for (let i = firstChunk; i < lastChunk; i++) {
            readChunks.current.set(i, (readChunks.current.get(i) ?? 0) + s.duration)
        }
    }, [clippedToHeight, articleRef, CHUNK_HEIGHT, readChunks])


    const recordReading = useCallback(() => {
        if (!idle.current) {
            const scrollStart = lastScroll.current.scrollY
            const scrollEnd = window.scrollY
            const now = Date.now();

            const duration = now - lastScroll.current.timestamp
            if (duration < 0) {
                console.log(`Warning: Tiempo de lectura negativo: ${duration}`)
            }
            newReadEvent({
                scrollY: scrollStart,
                duration: Math.max(duration, 0)
            })

            lastScroll.current = {scrollY: scrollEnd, timestamp: now}
        }
    }, [clippedToHeight, lastScroll])

    useEffect(() => {
        const handleActivity = () => updateActivity();

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                idle.current = true;
                recordReading();
            } else {
                updateActivity();
            }
        };

        window.addEventListener("scroll", handleActivity);
        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("keydown", handleActivity);
        window.addEventListener("visibilitychange", handleVisibilityChange);

        const idleChecker = setInterval(checkIdle, 1000);
        const readTracker = setInterval(recordReading, 500);

        return () => {
            window.removeEventListener("scroll", handleActivity);
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            window.removeEventListener("visibilitychange", handleVisibilityChange);
            clearInterval(idleChecker);
            clearInterval(readTracker);
        };
    }, [clippedToHeight])

    useEffect(() => {
        if (totalChunks != null) {
            const handleUnload = () => {
                recordReading();
                sendReadChunks(uri, readChunks.current, totalChunks)
                readChunks.current = new Map()
            };
            window.addEventListener("beforeunload", handleUnload);
            window.addEventListener("pagehide", handleUnload); // for bfcache cases

            return () => {
                window.removeEventListener("beforeunload", handleUnload);
                window.removeEventListener("pagehide", handleUnload);
            };
        }
    }, [totalChunks, clippedToHeight]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (setReadChunks) {
                setReadChunks(new Map(readChunks.current));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [clippedToHeight]);

    useEffect(() => {
        if (!totalChunks != null) {
            const sendInterval = FLUSH_INTERVAL;
            let lastSent = Date.now();

            const interval = setInterval(() => {
                const now = Date.now();
                const copy = new Map(readChunks.current);

                if (now - lastSent >= sendInterval && copy.size > 0) {
                    sendReadChunks(uri, copy, totalChunks)
                    readChunks.current = new Map()
                    lastSent = now;
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [totalChunks, clippedToHeight]);

    useEffect(() => {
        if (totalChunks != null) {
            return () => {
                if (readChunks.current.size > 0) {
                    sendReadChunks(uri, readChunks.current, totalChunks);
                    readChunks.current = new Map()
                }
            };
        }
    }, [pathname, searchParams, totalChunks, clippedToHeight])

    return totalChunks
};
