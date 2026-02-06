import {AppContext} from "#/setup.js";
import {SessionAgent} from "#/utils/session-agent.js";
import {
    ArCabildoabiertoFeedArticle,
    ArCabildoabiertoWikiTopicVersion, BatchEdit,
    CreateTopicVersionProps, EditPropsParams, EmbedContext, TopicForBatchEdit
} from "@cabildo-abierto/api";
import {Effect} from "effect";
import {searchTopicsSkeleton} from "#/services/search/search.js";
import {createTopicVersion, CreateTopicVersionError} from "#/services/write/topic.js";
import {getTopic, InsufficientParamsError} from "#/services/wiki/topics.js";
import {AppBskyEmbedImages} from "@atproto/api"
import {FetchImageURLError} from "#/services/blob.js";
import {EffHandler} from "#/utils/handler.js";
import {NotFoundError} from "#/services/dataset/read.js";
import {cleanText, propsIncluded} from "@cabildo-abierto/utils";
import {DBSelectError} from "#/utils/errors.js";



export const batchEditHandler: EffHandler<BatchEdit> = (ctx, agent, params) => {
    return batchEdit(ctx, agent, params).pipe(
        Effect.catchAll(error => {
            return Effect.fail(`Ocurrió un error al editar los temas en batch: ${error._tag}.`)
        }),
        Effect.map(() => ({}))
    )
}


export const batchEdit = (ctx: AppContext, agent: SessionAgent, data: BatchEdit) => Effect.gen(function* () {
    for(const t of data.topics) {
        yield* editTopicInBatch(ctx, agent, t, data.message)
    }
})


class SimilarTopicsFoundError {
    readonly _tag = "SimilarTopicsFoundError"
}


export const editTopicHandler: EffHandler<EditPropsParams, boolean> = (ctx, agent, params) => {
    return editTopicInBatch(ctx, agent, params.topic, params.message).pipe(
        Effect.catchAll(error => {
            return Effect.fail(`Error: ${error._tag}`)
        })
    )
}


function editProps(curProps: ArCabildoabiertoWikiTopicVersion.TopicProp[], newProps: ArCabildoabiertoWikiTopicVersion.TopicProp[], propsToDelete: string[]) {
    const newPropsMap = new Map<string, ArCabildoabiertoWikiTopicVersion.TopicProp>()
    for(const p of curProps) {
        newPropsMap.set(p.name, p)
    }
    for(const p of newProps) {
        // sobreescribimos las que ya existan
        newPropsMap.set(p.name, p)
    }
    for(const p of propsToDelete) {
        newPropsMap.delete(p)
    }
    return Array.from(newPropsMap.values())
}


const editTopicInBatch = (ctx: AppContext, agent: SessionAgent, t: TopicForBatchEdit, message: string): Effect.Effect<boolean, CreateTopicVersionError | SimilarTopicsFoundError | MultipleImagesInEmbedError | FetchImageURLError | NotFoundError | InsufficientParamsError> => Effect.gen(function* () {

    const searchResults = yield* searchTopicsSkeleton(ctx, t.id)

    const topic = yield* Effect.tryPromise({
        try: () => ctx.kysely
            .selectFrom("Topic")
            .innerJoin("TopicVersion", "Topic.currentVersionId", "TopicVersion.uri")
            .select(["id", "props"]).where("id", "=", t.id)
            .executeTakeFirst(),
        catch: () => new DBSelectError()
    })

    if(searchResults.length == 0 && !topic) {
        const params: CreateTopicVersionProps = {
            id: t.id,
            props: t.props
        }
        ctx.logger.pino.info({id: t.id}, "Updating topic")
        yield* createTopicVersion(ctx, agent, params)
        return true
    } else {
        let applyToId = t.id
        if(topic) {
            // los ids coinciden
        } else if(cleanText(searchResults[0].id) == cleanText(t.id)) {
            applyToId = searchResults[0].id
        } else {
            return yield* Effect.fail(new SimilarTopicsFoundError())
        }
        const cur = yield* getTopic(
            ctx,
            agent,
            applyToId
        )

        const embedContexts = cur.embeds ? yield* Effect.all(cur.embeds.map(e => recreateEmbedContext(ctx, agent, e))) : []

        const curProps = cur.props ?? []

        if(propsIncluded(t.props, curProps) && t.propsToDelete.length == 0) {
            ctx.logger.pino.info({applyToId}, "Skipping topic")
            return false
        }

        ctx.logger.pino.info({applyToId}, "Updating topic")

        const params: CreateTopicVersionProps = {
            id: applyToId,
            props: editProps(curProps, t.props, t.propsToDelete),
            text: cur.text,
            format: cur.format,
            message,
            claimsAuthorship: false,
            embeds: cur.embeds,
            embedContexts
        }

        yield* createTopicVersion(ctx, agent, params)
        return true
    }
})


class MultipleImagesInEmbedError {
    readonly _tag = "MultipleImagesInEmbedError"
}


export const fetchImageAsBase64 = (imageUrl: string): Effect.Effect<string, FetchImageURLError> => Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
        try: () => fetch(imageUrl),
        catch: () => new FetchImageURLError()
    })

    if (!response.ok) {
        return yield* Effect.fail(new FetchImageURLError())
    }

    const arrayBuffer = yield* Effect.tryPromise({
        try: () => response.arrayBuffer(),
        catch: () => new FetchImageURLError()
    })
    const buffer = Buffer.from(arrayBuffer);

    return buffer.toString("base64");
})


const recreateEmbedContext = (
    ctx: AppContext,
    agent: SessionAgent,
    embed: ArCabildoabiertoFeedArticle.ArticleEmbedView
): Effect.Effect<EmbedContext, MultipleImagesInEmbedError | FetchImageURLError> => Effect.gen(function* () {
    if(AppBskyEmbedImages.isView(embed.value)) {
        if(embed.value.images.length > 0) return yield* Effect.fail(new MultipleImagesInEmbedError())
        const fullsize = embed.value.images[0].fullsize
        const base64 = yield* fetchImageAsBase64(fullsize)
        return {
            base64files: [base64]
        }
    }
    return null
})