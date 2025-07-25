import {SelectionQuoteContext} from "@/components/feed/embed/selection-quote/selection-quote-context";
import {SelectionQuoteText} from "@/components/feed/embed/selection-quote/selection-quote-text";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {useRouter} from "next/navigation";
import {contentUrl, getCollectionFromUri, isArticle} from "@/utils/uri";
import {ATProtoStrongRef} from "@/lib/types";
import {MarkdownSelection} from "../../../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {ArticleEmbedView} from "@/lex-api/types/ar/cabildoabierto/feed/article";
import {useEffect, useState} from "react";
import {
    anyEditorStateToMarkdown,
    markdownToEditorState
} from "../../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {ProcessedLexicalState} from "../../../../../modules/ca-lexical-editor/src/selection/processed-lexical-state";
import LoadingSpinner from "../../../../../modules/ui-utils/src/loading-spinner";
import {LexicalSelection} from "../../../../../modules/ca-lexical-editor/src/selection/lexical-selection";

async function validSelectionForComment(text: string, embeds: ArticleEmbedView[], format: string, selection: MarkdownSelection | LexicalSelection): Promise<MarkdownSelection | null> {
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
    } catch (err) {
        console.log("Error: ", err)
        return null
    }
}

type SelectionQuoteProps = {
    onClick?: (cid: string) => void
    mainPostRef?: ATProtoStrongRef
    showContext?: boolean
    quotedContent: string
    quotedText: string
    quotedContentEmbeds?: ArticleEmbedView[]
    quotedContentAuthor: ProfileViewBasic
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
        className={"article-content no-margin-first pr-2 " + (isArticle(collection) ? "" : "not-article-content")}>
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
            />}
            {normalizedSelection && normalizedSelection == "error" && <div className={"p-2"}>
                ¡Uh! No pudimos procesar la selección.
            </div>}
            {!normalizedSelection && <LoadingSpinner/>}
        </blockquote>
    </div>
}