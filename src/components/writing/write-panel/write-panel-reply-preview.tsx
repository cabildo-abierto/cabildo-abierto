import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {isFullArticleView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isTopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {SelectionQuote} from "@/components/feed/embed/selection-quote/selection-quote"
import {Record as ArticleRecord} from "@/lex-api/types/ar/cabildoabierto/feed/article"
import {Record as TopicVersionRecord} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion"

type Props = {
    replyTo: ReplyToContent,
    selection?: [number, number]
}

export const WritePanelReplyPreview = ({replyTo, selection}: Props) => {
    if (selection) {
        if (isTopicView(replyTo) || isFullArticleView(replyTo)) {
            return <div className={"pb-2 pr-2"}>
                <SelectionQuote
                    quotedContent={replyTo.uri}
                    quotedText={replyTo.text}
                    quotedTextFormat={replyTo.format}
                    quotedContentAuthor={replyTo.author}
                    start={selection[0]}
                    end={selection[1]}
                />
            </div>
        }
    }
    return null
}