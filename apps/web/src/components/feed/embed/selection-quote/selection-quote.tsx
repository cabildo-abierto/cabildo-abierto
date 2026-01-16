import {SelectionQuoteContext} from "./selection-quote-context";
import {SelectionQuoteText} from "./selection-quote-text";
import {useRouter} from "next/navigation";
import {getCollectionFromUri, isArticle} from "@cabildo-abierto/utils";
import {ATProtoStrongRef} from "@cabildo-abierto/api";
import {useEffect, useState} from "react";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {ArCabildoabiertoFeedArticle, ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import {Note} from "@/components/utils/base/note";
import {MarkdownSelection} from "@/components/editor/selection/markdown-selection";
import {anyEditorStateToMarkdown, markdownToEditorState} from "../../../editor/markdown-transforms";
import {LexicalSelection} from "@/components/editor/selection/lexical-selection";
import {ProcessedLexicalState} from "@/components/editor/selection/processed-lexical-state";
import {contentUrl} from "@/components/utils/react/url";

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
    editedParent?: boolean
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
    selection,
    editedParent
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
                router.push(contentUrl(quotedContent, quotedContentAuthor?.handle) + "&s=normal" + "#" + mainPostRef.cid)
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
            {editedParent && <div className={"text-xs font-light"}>
                El contenido principal fue editado después de esta respuesta. Es posible que la cita haya quedado corrida.
            </div>}
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
            {normalizedSelection && normalizedSelection == "error" && <Note className={"p-2 text-left"}>
                No pudimos procesar la selección. Probá seleccionar menos contenido.
            </Note>}
            {!normalizedSelection && <LoadingSpinner/>}
        </blockquote>
    </div>
}