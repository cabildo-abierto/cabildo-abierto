import Link from "next/link";
import {PencilSimpleIcon} from "@phosphor-icons/react";
import type {TopicSummary} from "@cabildo-abierto/api";
import {Button} from "@/components/ui/button";

export function TopicTitle({topic, editing}: {topic: TopicSummary; editing: boolean}) {
    return <div className="group/title flex w-fit items-center gap-2">
        <h1 className="text-2xl font-semibold">{topic.title}</h1>
        {editing && <Button nativeButton={false}
            render={<Link href={`/tema/${encodeURIComponent(topic.slug)}/titulo`}/>}
            variant="ghost" size="icon-xs"
            className="shrink-0 opacity-0 transition-opacity group-hover/title:opacity-100 group-focus-within/title:opacity-100"
            aria-label="Ver títulos y proponer un cambio" title="Cambiar título">
            <PencilSimpleIcon/>
        </Button>}
    </div>;
}
