import {Fragment} from "react";
import {cn} from "@/lib/utils";

export function TextWithLinks({text, linksEnabled = true}: {text: string; linksEnabled?: boolean}) {
    if (!linksEnabled) return text;
    const matches = Array.from(text.matchAll(/https?:\/\/[^\s<>"']+/gi));
    let offset = 0;
    const parts = matches.map(match => {
        let url = match[0].replace(/[.,;:!?]+$/, "");
        while (/[)\]}]$/.test(url)) {
            const closing = url.at(-1)!;
            const opening = closing === ")" ? "(" : closing === "]" ? "[" : "{";
            if (url.split(closing).length <= url.split(opening).length) break;
            url = url.slice(0, -1).replace(/[.,;:!?]+$/, "");
        }
        const start = match.index;
        const preceding = text.slice(offset, start);
        offset = start + url.length;
        return <Fragment key={start}>{preceding}<a href={url} target="_blank" rel="noopener noreferrer" className={cn("relative z-10 underline underline-offset-2 hover:text-foreground")}>{url}</a></Fragment>;
    });
    return <>{parts}{text.slice(offset)}</>;
}
