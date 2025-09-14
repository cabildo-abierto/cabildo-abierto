import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {SelectionQuote} from "@/components/feed/embed/selection-quote/selection-quote"
import {MarkdownSelection} from "../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {LexicalSelection} from "../../../../modules/ca-lexical-editor/src/selection/lexical-selection";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"


type Props = {
    replyTo: ReplyToContent,
    selection?: MarkdownSelection | LexicalSelection
}


export const WritePanelReplyPreview = ({replyTo, selection}: Props) => {
    if (selection) {
        if (ArCabildoabiertoWikiTopicVersion.isTopicView(replyTo) || ArCabildoabiertoFeedDefs.isFullArticleView(replyTo)) {
            return <div className={"pb-2 pr-2"}>
                <SelectionQuote
                    quotedContent={replyTo.uri}
                    quotedText={replyTo.text}
                    quotedTextFormat={replyTo.format}
                    quotedContentEmbeds={(ArCabildoabiertoFeedDefs.isFullArticleView(replyTo) || ArCabildoabiertoWikiTopicVersion.isTopicView(replyTo)) ? replyTo.embeds : []}
                    quotedContentAuthor={replyTo.author}
                    selection={selection}
                />
            </div>
        }
    }
    return null
}