"use client"

import Link from "next/link";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import type {SearchTopicsOutput} from "@cabildo-abierto/api";
import {XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {get} from "@/utils/react/fetch";
import {useDebounce} from "@/utils/react/debounce";
import {Spinner} from "@/components/ui/spinner";

export default function Page() {
    const [search, setSearch] = useState("");
    const query = useDebounce(search.trim(), 250);
    const topicsQuery = useQuery({
        queryKey: ["topics", "search", query],
        queryFn: async () => {
            const result = await get<SearchTopicsOutput>(`/topics?search=${encodeURIComponent(query)}`);
            if ("error" in result) throw new Error(result.error);
            return result.value.topics;
        },
        enabled: Boolean(query),
    });
    const topics = topicsQuery.data ?? [];
    const loading = topicsQuery.isFetching;
    const error = topicsQuery.error instanceof Error ? topicsQuery.error.message : null;

    return <div className="flex min-h-[calc(100vh-3rem)] w-full items-center justify-center">
        <div className="flex w-full max-w-md flex-col items-start space-y-3 p-3">
            <h1 className="w-full text-center">Cabildo Abierto</h1>
            <div className="relative w-full">
                <Input type="text" inputMode="search" autoComplete="off" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscá temas..." className="w-full pr-9" aria-label="Buscar temas por título"/>
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
                {loading && <p className="flex items-center gap-2 px-2 text-xs text-muted-foreground"><Spinner/>Buscando…</p>}
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
