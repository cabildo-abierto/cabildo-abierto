import {CAHandlerNoAuth} from "#/utils/handler.js";
import {ArCabildoabiertoFeedArticle, ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import {diff, nodesCharDiff} from "#/services/wiki/diff.js";
import {getDidFromUri, getUri} from "@cabildo-abierto/utils";
import {getTopicVersion} from "#/services/wiki/topics.js";
import {anyEditorStateToMarkdownOrLexical} from "#/utils/lexical/transforms.js";
import { Dataplane } from "../hydration/dataplane.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";


export const getNewVersionDiff: CAHandlerNoAuth<{currentText: string, currentFormat: string, markdown: string, embeds: ArCabildoabiertoFeedArticle.ArticleEmbed[]}, {charsAdded: number, charsDeleted: number}> = async (ctx, agent, params) => {
    const nodes1 = anyEditorStateToNodesForDiff(params.currentText, params.currentFormat)
    const nodes2 = anyEditorStateToNodesForDiff(params.markdown, "markdown")

    if(!nodes1 || !nodes2){
        return {error: "No se pudo procesar una de las versiones."}
    }

    const d = nodesCharDiff(nodes1, nodes2, true)

    return {
        data: {
            charsAdded: d?.charsAdded,
            charsDeleted: d?.charsDeleted
        }
    }
}


export type MatchesType = {
    matches: {x: number, y: number}[]
    common: {x: number, y: number}[]
    perfectMatches: {x: number, y: number}[]
}

export type TopicVersionChangesProps = {
    prevText: string
    prevFormat: string | undefined
    curText: string
    curFormat: string | undefined
    curAuthor?: ArCabildoabiertoActorDefs.ProfileViewBasic
    prevAuthor?: ArCabildoabiertoActorDefs.ProfileViewBasic
    diff: MatchesType
}


function anyEditorStateToNodesForDiff(text: string, format?: string | null) {
    const mdOrLexical = anyEditorStateToMarkdownOrLexical(text, format)
    if (mdOrLexical.format == "lexical"){
        return null
    } else {
        return mdOrLexical.text.split("\n\n")
    }
}


export const getTopicVersionChanges: CAHandlerNoAuth<{
    params: { curDid: string, curRkey: string, prevDid: string, prevRkey: string }
}, TopicVersionChangesProps> = async (ctx, agent, {params}) => {
    const {curDid, prevDid, curRkey, prevRkey} = params

    const curUri = getUri(curDid, "ar.cabildoabierto.wiki.topicVersion", curRkey)
    const prevUri = getUri(prevDid, "ar.cabildoabierto.wiki.topicVersion", prevRkey)

    const dataplane = new Dataplane(ctx, agent)

    const curAuthorId = getDidFromUri(curUri)
    const prevAuthorId = getDidFromUri(prevUri)
    const [cur, prev] = await Promise.all([
        getTopicVersion(ctx, curUri),
        getTopicVersion(ctx, prevUri),
        dataplane.fetchProfileViewBasicHydrationData([curAuthorId, prevAuthorId])
    ])

    if(!cur.data || !prev.data){
        return {error: "No se encontró una de las versiones."}
    }

    const nodes1 = anyEditorStateToNodesForDiff(prev.data.text, prev.data.format)
    const nodes2 = anyEditorStateToNodesForDiff(cur.data.text, cur.data.format)

    if(!nodes1 || !nodes2){
        return {error: "No se pudo procesar una de las versiones."}
    }

    const d = diff(nodes1, nodes2, true)

    const curAuthor = hydrateProfileViewBasic(ctx, curAuthorId, dataplane) ?? undefined
    const prevAuthor = hydrateProfileViewBasic(ctx, prevAuthorId, dataplane) ?? undefined

    return {
        data: {
            curText: cur.data.text,
            curFormat: cur.data.format,
            prevText: prev.data.text,
            prevFormat: prev.data.format,
            curAuthor,
            prevAuthor,
            diff: d
        }
    }
}