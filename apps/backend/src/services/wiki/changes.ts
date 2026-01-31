import {CAHandlerNoAuth, EffHandlerNoAuth} from "#/utils/handler.js";
import {ArCabildoabiertoFeedArticle, ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import {diff, nodesCharDiff} from "#/services/wiki/diff.js";
import {getDidFromUri, getUri} from "@cabildo-abierto/utils";
import {getTopicVersion} from "#/services/wiki/topics.js";
import {anyEditorStateToMarkdownOrLexical} from "#/utils/lexical/transforms.js";
import {DataPlane, makeDataPlane} from "../hydration/dataplane.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {Effect} from "effect";


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


export const getTopicVersionChanges: EffHandlerNoAuth<{
    params: { curDid: string, curRkey: string, prevDid: string, prevRkey: string }
}, TopicVersionChangesProps> = (ctx, agent, {params}) => Effect.provideServiceEffect(Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const {curDid, prevDid, curRkey, prevRkey} = params

    const curUri = getUri(curDid, "ar.cabildoabierto.wiki.topicVersion", curRkey)
    const prevUri = getUri(prevDid, "ar.cabildoabierto.wiki.topicVersion", prevRkey)

    const curAuthorId = getDidFromUri(curUri)
    const prevAuthorId = getDidFromUri(prevUri)
    const [cur, prev] = yield* Effect.all([
        getTopicVersion(ctx, curUri),
        getTopicVersion(ctx, prevUri),
        dataplane.fetchProfileViewBasicHydrationData([curAuthorId, prevAuthorId])
    ])

    const nodes1 = anyEditorStateToNodesForDiff(prev.text, prev.format)
    const nodes2 = anyEditorStateToNodesForDiff(cur.text, cur.format)

    if(!nodes1 || !nodes2){
        return yield* Effect.fail("No se pudo procesar una de las versiones.")
    }

    const d = diff(nodes1, nodes2, true)

    const curAuthor = (yield* hydrateProfileViewBasic(ctx, curAuthorId)) ?? undefined
    const prevAuthor = (yield* hydrateProfileViewBasic(ctx, prevAuthorId)) ?? undefined

    const res: TopicVersionChangesProps = {
        curText: cur.text,
        curFormat: cur.format,
        prevText: prev.text,
        prevFormat: prev.format,
        curAuthor,
        prevAuthor,
        diff: d
    }
    return res
}).pipe(Effect.catchTag("NotFoundError", () => Effect.fail("No se encontró el tema.")), Effect.catchAll(() => Effect.fail("Ocurrió un error al obtener el tema."))), DataPlane, makeDataPlane(ctx, agent))