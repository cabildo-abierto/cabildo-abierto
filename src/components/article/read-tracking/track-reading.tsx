import {RefObject, useEffect, useRef } from "react";
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
const IDLE_TIMEOUT = 60000; // 60s
const FLUSH_INTERVAL = 300000 // 30s

type ReadEvent = {
    scrollY: number
    duration: number
}

export const useTrackReading = (uri: string, articleRef: RefObject<HTMLElement>, setReadChunks?: (r: Map<number, number>) => void) => {
    const readChunks = useRef<Map<number, number>>(new Map())
    const lastActivity = useRef(Date.now())
    const idle = useRef(false)
    const lastScroll = useRef<{scrollY: number, timestamp: number}>({scrollY: 0, timestamp: Date.now()})
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const articleStart = articleRef.current?.offsetTop
    const articleEnd = articleRef.current?.offsetTop + articleRef.current?.offsetHeight
    const totalChunks = Math.ceil((articleEnd - articleStart) / CHUNK_HEIGHT)

    const updateActivity = () => {
        lastActivity.current = Date.now();
        idle.current = false;
    }

    // se chequea cada 1 seg
    const checkIdle = () => {
        if (Date.now() - lastActivity.current > IDLE_TIMEOUT) {
            idle.current = true
        }
    }

    function newReadEvent(s: ReadEvent){
        const articleStart = articleRef.current?.offsetTop
        const articleEnd = articleRef.current?.offsetTop + articleRef.current?.offsetHeight
        const readSegmentStart = s.scrollY
        const readSegmentEnd = s.scrollY + window.innerHeight
        if(readSegmentEnd < articleStart) return
        if(readSegmentStart > articleEnd) return

        const firstChunk = Math.max(Math.floor((readSegmentStart - articleStart) / CHUNK_HEIGHT), 0)
        const lastChunk = Math.ceil((Math.min(readSegmentEnd, articleEnd) - articleStart) / CHUNK_HEIGHT)

        for(let i = firstChunk; i < lastChunk; i++){
            readChunks.current.set(i, (readChunks.current.get(i) ?? 0) + s.duration)
        }
    }

    const recordReading = () => {
        if(!idle.current){
            const scrollStart = lastScroll.current.scrollY
            const scrollEnd = window.scrollY
            const now = Date.now();

            newReadEvent({
                scrollY: scrollStart,
                duration: now - lastScroll.current.timestamp
            })

            lastScroll.current = {scrollY: scrollEnd, timestamp: now}
        }
    };

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
    }, []);

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if(setReadChunks){
                setReadChunks(new Map(readChunks.current));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        return () => {
            if (readChunks.current.size > 0) {
                sendReadChunks(uri, readChunks.current, totalChunks);
                readChunks.current = new Map()
            }
        };
    }, [pathname, searchParams])

    return totalChunks
};
