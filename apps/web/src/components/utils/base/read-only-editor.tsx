import ReactMarkdown from "react-markdown"
import {cn} from "@/lib/utils";

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
        className={cn("prose prose-invert max-w-none", className)}
    >
        <ReactMarkdown>
            {text}
        </ReactMarkdown>
    </div>
}