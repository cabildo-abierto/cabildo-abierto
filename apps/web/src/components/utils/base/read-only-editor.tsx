import {cn} from "@/lib/utils";

function renderTextWithLinks(text: string) {
    const parts: React.ReactNode[] = []
    let last = 0

    const regex =
        /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g
    let match

    while ((match = regex.exec(text))) {
        if (match.index > last) {
            parts.push(text.slice(last, match.index))
        }

        let href = match[2]
        if(href.startsWith("https://cabildoabierto.ar")) {
            href = href.replace("https://cabildoabierto.ar", "")
        } else if(href.startsWith("https://cabildoabierto.com.ar")) {
            href = href.replace("https://cabildoabierto.com.ar", "")
        }
        const local = href.startsWith("/")

        parts.push(
            <a
                key={match.index}
                href={match[2]}
                target={local ? undefined : "_blank"}
                rel={local ? undefined : "noopener noreferrer"}
                className="underline"
            >
                {match[1]}
            </a>
        )

        last = match.index + match[0].length
    }

    if (last < text.length) {
        parts.push(text.slice(last))
    }

    return parts
}

export const ReadOnlyEditor = ({
                                   text,
                                   className,
                                   fontSize
                               }: {
    text: string
    className?: string
    fontSize?: number
}) => {

    return <div
        style={{fontSize}}
        className={cn("prose prose-invert max-w-none whitespace-pre-wrap", className)}
    >
        {renderTextWithLinks(text)}
    </div>
}