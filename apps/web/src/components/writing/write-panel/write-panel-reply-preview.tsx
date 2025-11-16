import {ReplyToContent} from "./write-panel";
import {SelectionQuote} from "../../feed/embed/selection-quote/selection-quote"
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {PostPreviewFrame} from "../../feed/utils/post-preview-frame";
import {PostContent} from "../../feed/post/post-content";
import {MarkdownSelection} from "@/components/editor/selection/markdown-selection";
import {LexicalSelection} from "@/components/editor/selection/lexical-selection";


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
                    quotedContentAuthor={(ArCabildoabiertoFeedDefs.isArticleView(replyTo) || ArCabildoabiertoFeedDefs.isFullArticleView(replyTo) || ArCabildoabiertoFeedDefs.isPostView(replyTo)) ? replyTo.author : undefined}
                    selection={selection}
                />
            </div>
        }
    } else if(ArCabildoabiertoFeedDefs.isPostView(replyTo)) {
        return <PostPreviewFrame
            postView={replyTo}
            showingParent={false}
            borderBelow={true}
            engagementIcons={false}
            onWritePost={true}
        >
            <PostContent
                postView={replyTo}
                onWritePost={true}
            />
        </PostPreviewFrame>
    }
    return null
}