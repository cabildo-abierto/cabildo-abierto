"use client"

import Link from "next/link";
import {useEffect, useState} from "react";
import type {SearchTopicsOutput, TopicSummary} from "@cabildo-abierto/api";
import {XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {get} from "@/utils/react/fetch";

export default function Page() {
    const [search, setSearch] = useState("");
    const [topics, setTopics] = useState<TopicSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const query = search.trim();

    useEffect(() => {
        let current = true;
        if (!query) {
            setTopics([]);
            setLoading(false);
            setError(null);
            return () => { current = false; };
        }

        const timeout = window.setTimeout(async () => {
            setLoading(true);
            setError(null);
            const result = await get<SearchTopicsOutput>(`/topics?search=${encodeURIComponent(query)}`);
            if (!current) return;
            setLoading(false);
            if ("error" in result) {
                setTopics([]);
                setError(result.error);
                return;
            }
            setTopics(result.value.topics);
        }, 250);

        return () => {
            current = false;
            window.clearTimeout(timeout);
        };
    }, [query]);

    return <div className="flex min-h-[calc(100vh-3rem)] w-full items-center justify-center">
        <div className="flex w-full max-w-md flex-col items-start space-y-3 p-3">
            <h1 className="w-full text-center">Cabildo Abierto</h1>
            <div className="relative w-full">
                <Input type="text" inputMode="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscá temas..." className="w-full pr-9" aria-label="Buscar temas por título"/>
                {search && <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => setSearch("")}
                    aria-label="Limpiar búsqueda"
                    title="Limpiar búsqueda"
                >
                    <XIcon weight="bold"/>
                </Button>}
            </div>
            <div className="w-full" aria-live="polite">
                {loading && <p className="px-2 text-xs text-muted-foreground">Buscando…</p>}
                {error && <p className="px-2 text-xs text-destructive">{error}</p>}
                {!loading && !error && query && topics.length === 0 && <p className="px-2 text-xs text-muted-foreground">No encontramos temas con ese título.</p>}
                {!loading && topics.length > 0 && <ul className="overflow-hidden rounded-lg border bg-card">
                    {topics.map(topic => <li key={topic.id} className="border-b last:border-b-0">
                        <Link href={`/tema/${encodeURIComponent(topic.id)}`} className="block px-3 py-2 hover:bg-muted">
                            <span className="block text-sm font-medium">{topic.title}</span>
                            <span className="block text-xs text-muted-foreground">{topic.id}</span>
                        </Link>
                    </li>)}
                </ul>}
            </div>
        </div>
    </div>;
}
