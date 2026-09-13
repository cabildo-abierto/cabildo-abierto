"use client"

import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import type {SearchTopicsOutput} from "@cabildo-abierto/api";
import {XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {get} from "@/utils/react/fetch";
import {useDebounce} from "@/utils/react/debounce";
import {Spinner} from "@/components/ui/spinner";
import {TopicSearchResult} from "@/components/topic-search-result";

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
    });
    const topics = topicsQuery.data ?? [];
    const loading = topicsQuery.isFetching;
    const error = topicsQuery.error instanceof Error ? topicsQuery.error.message : null;

    return <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col px-4 pt-10 pb-8 sm:px-6 sm:pt-14">
        <section className="mx-auto flex w-full max-w-xl animate-in flex-col gap-4 fade-in-0 slide-in-from-top-2 duration-500 motion-reduce:animate-none">
            <h1 className="text-center text-2xl font-semibold">Cabildo Abierto</h1>
            <div className="relative transition-[transform,box-shadow] duration-200 focus-within:scale-[1.01] focus-within:shadow-sm motion-reduce:transition-none">
                <Input type="text" inputMode="search" autoComplete="off" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscá temas..." className="w-full pr-9" aria-label="Buscar temas por título"/>
                {search && <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="absolute top-1/2 right-2 -translate-y-1/2 animate-in rounded-full text-muted-foreground fade-in-0 zoom-in-75 duration-150 hover:text-foreground motion-reduce:animate-none"
                    onClick={() => setSearch("")}
                    aria-label="Limpiar búsqueda"
                    title="Limpiar búsqueda"
                >
                    <XIcon weight="bold"/>
                </Button>}
            </div>
        </section>
        <section className="mt-8 w-full" aria-live="polite">
            {loading && <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Spinner className={"size-8"}/>
            </p>}
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
            {!loading && !error && topics.length === 0 && <p className="text-center text-sm text-muted-foreground">
                {query ? "No encontramos temas con ese título." : "Todavía no hay temas."}
            </p>}
            {!loading && !error && topics.length > 0 && <ul key={query} className="flex flex-wrap justify-center gap-4">
                {topics.map((topic, index) => <li key={topic.id}
                    className="w-full animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-300 motion-reduce:animate-none sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
                    style={{animationDelay: `${Math.min(index * 35, 280)}ms`}}>
                    <TopicSearchResult topic={topic}/>
                </li>)}
            </ul>}
        </section>
    </main>;
}
