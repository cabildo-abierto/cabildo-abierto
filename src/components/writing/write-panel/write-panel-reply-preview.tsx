import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {isFullArticleView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isTopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {SelectionQuote} from "@/components/feed/embed/selection-quote/selection-quote"
import {Record as ArticleRecord} from "@/lex-api/types/ar/cabildoabierto/feed/article"
import {MarkdownSelection} from "../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {LexicalSelection} from "../../../../modules/ca-lexical-editor/src/selection/lexical-selection";

type Props = {
    replyTo: ReplyToContent,
    selection?: MarkdownSelection | LexicalSelection
}


export const WritePanelReplyPreview = ({replyTo, selection}: Props) => {
    if (selection) {
        if (isTopicView(replyTo) || isFullArticleView(replyTo)) {
            return <div className={"pb-2 pr-2"}>
                <SelectionQuote
                    quotedContent={replyTo.uri}
                    quotedText={replyTo.text}
                    quotedTextFormat={replyTo.format}
                    quotedContentEmbeds={(isFullArticleView(replyTo) || isTopicView(replyTo)) ? replyTo.embeds : []}
                    quotedContentAuthor={replyTo.author}
                    selection={selection}
                />
            </div>
        }
    }
    return null
}