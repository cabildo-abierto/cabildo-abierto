"use client"
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {isFullArticleView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {SelectionQuote} from "@/components/feed/embed/selection-quote/selection-quote";

type WritePanelReplyProps = {
    replyTo: ReplyToContent
    selection: [number, number]
}

export const WritePanelReply = ({replyTo, selection}: WritePanelReplyProps) => {
    return <div>
        {isFullArticleView(replyTo) && selection && <div>
            <SelectionQuote
                quotedContent={replyTo.uri}
                quotedText={replyTo.text}
                quotedContentAuthor={replyTo.author}
                quotedTextFormat={replyTo.textFormat}
                start={selection[0]}
                end={selection[1]}
            />
        </div>}
    </div>
}