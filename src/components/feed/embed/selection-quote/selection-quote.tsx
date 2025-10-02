import {SelectionQuoteContext} from "@/components/feed/embed/selection-quote/selection-quote-context";
import {SelectionQuoteText} from "@/components/feed/embed/selection-quote/selection-quote-text";
import {useRouter} from "next/navigation";
import {contentUrl, getCollectionFromUri, isArticle} from "@/utils/uri";
import {ATProtoStrongRef} from "@/lib/types";
import {MarkdownSelection} from "../../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {useEffect, useState} from "react";
import {
    anyEditorStateToMarkdown,
    markdownToEditorState
} from "../../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {ProcessedLexicalState} from "../../../../../modules/ca-lexical-editor/src/selection/processed-lexical-state";
import LoadingSpinner from "../../../../../modules/ui-utils/src/loading-spinner";
import {LexicalSelection} from "../../../../../modules/ca-lexical-editor/src/selection/lexical-selection";
import {ArCabildoabiertoFeedArticle, ArCabildoabiertoActorDefs} from "@/lex-api/index"

async function validSelectionForComment(text: string, embeds: ArCabildoabiertoFeedArticle.ArticleEmbedView[], format: string, selection: MarkdownSelection | LexicalSelection): Promise<MarkdownSelection | null> {
    try {
        const markdown = anyEditorStateToMarkdown(text, format, embeds)
        const state = markdownToEditorState(
            markdown.markdown, true, true, markdown.embeds
        )
        if (selection instanceof LexicalSelection) {
            selection = selection.toMarkdownSelection(state)
        }
        if (selection.isEmpty()) {
            return null
        }
        const processedState = new ProcessedLexicalState(state)
        const lexicalSelection = selection.toLexicalSelection(processedState)
        const markdownSelectionBack = lexicalSelection.toMarkdownSelection(processedState)
        if (markdownSelectionBack.isEmpty()) {
            return null
        }
        const lexicalSelectionBack = markdownSelectionBack.toLexicalSelection(processedState)
        if (lexicalSelection.equivalentTo(lexicalSelectionBack, processedState)) {
            return markdownSelectionBack
        } else {
            return null
        }
    } catch {
        //console.log("Error: ", err)
        return null
    }
}

type SelectionQuoteProps = {
    onClick?: (cid: string) => void
    mainPostRef?: ATProtoStrongRef
    showContext?: boolean
    quotedContent: string
    quotedText: string
    quotedContentEmbeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
    quotedContentAuthor?: ArCabildoabiertoActorDefs.ProfileViewBasic
    quotedTextFormat?: string
    quotedContentTitle?: string
    selection: MarkdownSelection | LexicalSelection
}

export const SelectionQuote = ({
    onClick,
    mainPostRef,
    showContext = false,
    quotedContentTitle,
    quotedContentEmbeds,
    quotedContentAuthor,
    quotedContent,
    quotedText,
    quotedTextFormat,
    selection
}: SelectionQuoteProps) => {
    const [normalizedSelection, setNormalizedSelection] = useState<"error" | MarkdownSelection | null>(null)
    const router = useRouter()

    function handleClick(e) {
        e.preventDefault()
        e.stopPropagation()
        if (onClick) {
            setTimeout(() => {
                onClick(mainPostRef?.cid)
            }, 0);
        } else {
            if (mainPostRef) {
                router.push(contentUrl(quotedContent) + "&s=normal" + "#" + mainPostRef.cid)
            }
        }
    }

    useEffect(() => {
        setNormalizedSelection(null);
        const timeout = setTimeout(async () => {
            const n = await validSelectionForComment(quotedText, quotedContentEmbeds, quotedTextFormat, selection);
            setNormalizedSelection(n ?? "error");
        }, 0);

        return () => {
            clearTimeout(timeout);
        };
    }, [quotedText, quotedTextFormat, selection]);

    const clickable = onClick != undefined || mainPostRef != null

    const collection = getCollectionFromUri(quotedContent)

    return <div
        className={"article-content no-margin-first pr-2 " + (isArticle(collection) ? "" : "not-article-content")}
    >
        <blockquote
            className={"my-1 w-full " + (clickable ? "hover:bg-[var(--background-dark3)] cursor-pointer" : "")}
            onClick={handleClick}
        >
            {showContext && <SelectionQuoteContext
                quotedContent={quotedContent}
                quotedContentAuthor={quotedContentAuthor}
                quotedContentTitle={quotedContentTitle}
            />}
            {normalizedSelection && normalizedSelection != "error" && <SelectionQuoteText
                quotedText={quotedText}
                quotedTextFormat={quotedTextFormat}
                selection={normalizedSelection}
                quotedTextEmbeds={quotedContentEmbeds}
                quotedCollection={collection}
            />}
            {normalizedSelection && normalizedSelection == "error" && <div className={"p-2"}>
                Ocurrió un error al procesar la selección.
            </div>}
            {!normalizedSelection && <LoadingSpinner/>}
        </blockquote>
    </div>
}