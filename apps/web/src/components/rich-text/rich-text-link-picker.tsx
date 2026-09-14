"use client"

import {type FormEvent, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import type {SearchTopicsOutput, TopicSummary} from "@cabildo-abierto/api";
import {ArrowSquareOutIcon, MagnifyingGlassIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Spinner} from "@/components/ui/spinner";
import {get} from "@/utils/react/fetch";
import {useDebounce} from "@/utils/react/debounce";
import {cn} from "@/lib/utils";

export type RichTextLink = {type: "internal"; topicId: string} | {type: "external"; href: string};

function normalizedUrl(value: string): string | null {
    const candidate = /^[a-z][a-z\d+.-]*:/i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;
    try {
        const url = new URL(candidate);
        return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
    } catch {
        return null;
    }
}

export function RichTextLinkPicker({current, onApply, onRemove}: {
    current: RichTextLink | null
    onApply: (link: RichTextLink) => void
    onRemove: () => void
}) {
    const [mode, setMode] = useState<"internal" | "external">(current?.type ?? "external");
    const [search, setSearch] = useState("");
    const [url, setUrl] = useState(current?.type === "external" ? current.href : "");
    const [urlError, setUrlError] = useState<string | null>(null);
    const query = useDebounce(search.trim(), 200);
    const topicsQuery = useQuery({
        queryKey: ["topics", "search", query],
        queryFn: async () => {
            const result = await get<SearchTopicsOutput>(`/topics?search=${encodeURIComponent(query)}`);
            if ("error" in result) throw new Error(result.error);
            return result.value.topics;
        },
        enabled: mode === "internal",
    });

    const applyExternal = (event: FormEvent) => {
        event.preventDefault();
        const href = normalizedUrl(url);
        if (!href) {
            setUrlError("Ingresá una URL válida.");
            return;
        }
        onApply({type: "external", href});
    };

    return <div className="w-72 rounded-lg border bg-popover p-2 text-popover-foreground shadow-md"
        onMouseDown={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
        <div className="mb-2 grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
            <Button type="button" size="sm" variant={mode === "external" ? "default" : "ghost"} aria-pressed={mode === "external"}
                onClick={() => setMode("external")}>URL externo</Button>
            <Button type="button" size="sm" variant={mode === "internal" ? "default" : "ghost"} aria-pressed={mode === "internal"}
                onClick={() => setMode("internal")}>Tema</Button>
        </div>
        {mode === "internal" ? <>
            <div className="relative">
                <MagnifyingGlassIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"/>
                <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar temas…" className="pl-7" autoFocus/>
            </div>
            <ScrollArea className="mt-2 max-h-52">
                <div className="space-y-1 pr-3">
                    {topicsQuery.isFetching && <p className="flex items-center gap-2 p-2 text-xs text-muted-foreground"><Spinner/>Buscando…</p>}
                    {topicsQuery.isError && <p className="p-2 text-xs text-destructive">No pudimos buscar los temas.</p>}
                    {!topicsQuery.isFetching && topicsQuery.data?.length === 0 && <p className="p-2 text-xs text-muted-foreground">No encontramos temas.</p>}
                    {!topicsQuery.isFetching && topicsQuery.data?.map((topic: TopicSummary) => <Button key={topic.id} type="button" variant="ghost"
                        className={cn("h-auto w-full justify-start px-2 py-1.5 text-left", current?.type === "internal" && current.topicId === topic.id && "bg-muted")}
                        onClick={() => onApply({type: "internal", topicId: topic.id})}>
                        <span className="min-w-0"><span className="block truncate font-medium">{topic.title}</span><span className="block truncate text-[10px] text-muted-foreground">{topic.id}</span></span>
                    </Button>)}
                </div>
            </ScrollArea>
        </> : <form onSubmit={applyExternal} className="space-y-2">
            <div className="relative">
                <ArrowSquareOutIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"/>
                <Input value={url} onChange={event => { setUrl(event.target.value); setUrlError(null); }} placeholder="https://…" className="pl-7" autoFocus/>
            </div>
            {urlError && <p className="text-xs text-destructive">{urlError}</p>}
            <Button type="submit" size="sm" className="w-full">Aplicar link</Button>
        </form>}
        {current && <Button type="button" variant="ghost" size="sm" className="mt-2 w-full text-destructive hover:text-destructive" onClick={onRemove}>Quitar link</Button>}
    </div>;
}
