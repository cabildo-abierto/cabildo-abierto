import Link from "next/link";
import type {TopicSummary} from "@cabildo-abierto/api";
import {Card, CardContent} from "@/components/ui/card";

type TopicSearchResultProps = {
    topic: TopicSummary
}

export function TopicSearchResult({topic}: TopicSearchResultProps) {
    return <Link href={`/tema/${encodeURIComponent(topic.slug)}`} className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Card className="h-full py-0 transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-muted/50 hover:shadow-sm active:translate-y-0 motion-reduce:transition-none">
            <CardContent className="flex h-full flex-col justify-center gap-1 px-4 py-4">
                <span className="font-medium">{topic.title}</span>
                <span className="text-xs text-muted-foreground">{topic.id}</span>
            </CardContent>
        </Card>
    </Link>;
}
