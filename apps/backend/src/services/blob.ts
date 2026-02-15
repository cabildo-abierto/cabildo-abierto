import {DidResolver} from "@atproto/identity";
import {SessionAgent} from "#/utils/session-agent.js";
import {ImagePayloadForPostCreation} from "@cabildo-abierto/api";
import {AppContext} from "#/setup.js";
import {getBlobKey} from "#/services/hydration/dataplane.js";
import {redisCacheTTL} from "#/services/wiki/topics.js";
import {imageSize} from "image-size";
import {Effect, pipe} from "effect";
import {BlobRef as ATBlobRef} from "@atproto/lexicon";
import { BlobRef } from "./hydration/hydrate.js";
import {RedisCacheFetchError, RedisCacheSetError} from "#/services/redis/cache.js";


export class ServiceEndpointResolutionError {
    readonly _tag = "ServiceEndpointResolutionError"
}

export function getServiceEndpointForDid(ctx: AppContext, did: string): Effect.Effect<string, ServiceEndpointResolutionError> {
    const didres: DidResolver = new DidResolver({})
    return Effect.tryPromise({
        try: () => didres.resolve(did),
        catch: () => new ServiceEndpointResolutionError()
    }).pipe(
        Effect.flatMap(doc => {
            if (doc && doc.service && doc.service.length > 0 && doc.service[0].serviceEndpoint && typeof doc.service[0].serviceEndpoint == "string") {
                return Effect.succeed(doc.service[0].serviceEndpoint)
            } else {
                return Effect.fail(new ServiceEndpointResolutionError())
            }
        }),
        Effect.withSpan("getServiceEndpoitnForDid", {attributes: {did}})
    )
}


export class FetchBlobError {
    readonly _tag = "FetchBlobError"
}


export function fetchBlob(ctx: AppContext, blob: { cid: string, authorId: string }) {
    return Effect.gen(function* () {
        let serviceEndpoint = yield* getServiceEndpointForDid(ctx, blob.authorId)
        if (serviceEndpoint) {
            const url = serviceEndpoint + "/xrpc/com.atproto.sync.getBlob?did=" + blob.authorId + "&cid=" + blob.cid
            return yield* Effect.tryPromise({
                try: () => fetch(url),
                catch: () => {
                    return Effect.fail(new FetchBlobError())
                }
            })
        }
        return null
    })
}


export function fetchTextBlob(ctx: AppContext, ref: { cid: string, authorId: string }, retries: number = 0): Effect.Effect<string, FetchBlobError> {
    return Effect.gen(function* () {
        const res = yield* fetchBlob(ctx, ref).pipe(
            Effect.catchAll(() => Effect.succeed(null))
        )
        if (!res || res.status != 200) {
            if (retries > 0) {
                return yield* fetchTextBlob(ctx, ref, retries - 1)
            } else {
                return yield* Effect.fail(new FetchBlobError())
            }
        }
        return yield* Effect.tryPromise({
            try: () => res.blob().then(b => b.text()),
            catch: () => new FetchBlobError()
        })
    })

}


export function fetchTextBlobs(ctx: AppContext, blobs: BlobRef[], retries: number = 0): Effect.Effect<(string | null)[]> {

    return Effect.gen(function* () {
        if (blobs.length == 0) return []
        const keys: string[] = blobs.map(b => getBlobKey(b))

        let blobContents: (string | null)[] = yield* Effect.tryPromise({
            try: () => ctx.ioredis.mget(keys),
            catch: () => new RedisCacheFetchError()
        }).pipe(Effect.catchTag("RedisCacheFetchError", () => Effect.succeed(keys.map(k => null))))

        const pending: { i: number, blob: BlobRef }[] = []
        for (let i = 0; i < blobContents.length; i++) {
            if (!blobContents[i]) {
                pending.push({i, blob: blobs[i]})
            }
        }

        const res = yield* Effect.all(
            pending.map(p => fetchTextBlob(ctx, p.blob, retries).pipe(Effect.catchTag("FetchBlobError", () => Effect.succeed(null)))),
            {concurrency: 8}
        )

        for (let i = 0; i < pending.length; i++) {
            const r = res[i]
            if (r) {
                blobContents[pending[i].i] = r
            }
        }

        const pipeline = ctx.ioredis.pipeline()
        for (let i = 0; i < pending.length; i++) {
            const b = res[i]
            const k = getBlobKey(pending[i].blob)
            if (b) pipeline.set(k, b, 'EX', redisCacheTTL)
        }
        yield* Effect.tryPromise({
            try: () => pipeline.exec(),
            catch: () => new RedisCacheSetError()
        }).pipe(Effect.catchTag("RedisCacheSetError", () => {
            return Effect.void
        }))

        return blobContents
    })
}


export class UploadStringBlobError {
    readonly _tag = "UploadStringBlobError"
}


export function uploadStringBlob(agent: SessionAgent, s: string, encoding?: string): Effect.Effect<ATBlobRef, UploadStringBlobError> {
    const encoder = new TextEncoder()
    const uint8 = encoder.encode(s)

    return Effect.tryPromise({
        try: () => agent.bsky.uploadBlob(uint8, {encoding}),
        catch: () => new UploadStringBlobError()
    }).pipe(
        Effect.map(({data}) => {
            return data.blob
        })
    )
}


export class FetchImageURLError {
    readonly _tag = "FetchImageURLError"
}


export function uploadImageSrcBlob(agent: SessionAgent, src: string): Effect.Effect<UploadedImage, UploadImageFromURLError | FetchImageURLError> {

    return pipe(
        Effect.tryPromise({
            try: async () => {
                const response = await fetch(src)
                const arrayBuffer = await response.arrayBuffer();
                return new Uint8Array(arrayBuffer);
            },
            catch: () => new FetchImageURLError()
        }),
        Effect.flatMap(uint8 =>
            Effect.all([
                Effect.tryPromise({
                    try: () => agent.bsky.uploadBlob(uint8),
                    catch: () => new UploadImageFromURLError()
                }),
                Effect.succeed(uint8)
            ])
        ),
        Effect.flatMap(([res, uint8]) => Effect.succeed({ref: res.data.blob, size: imageSize(uint8)}))
        )
}


export function uploadBase64Blob(agent: SessionAgent, base64: string): Effect.Effect<UploadedImage, UploadImageFromBase64Error> {
    const base64Data = base64.replace(/^data:.*?;base64,/, '');
    const arrayBuffer = Buffer.from(base64Data, "base64")
    const uint8 = new Uint8Array(arrayBuffer);

    return Effect.tryPromise({
        try: () => agent.bsky.uploadBlob(uint8),
        catch: () => new UploadImageFromBase64Error()
    }).pipe(Effect.flatMap(res => Effect.succeed({ref: res.data.blob, size: imageSize(uint8)})))
}


export type UploadedImage = {
    ref: ATBlobRef,
    size: { width: number, height: number }
}


export class UploadImageFromURLError {
    readonly _tag = "UploadImageFromURLError"
}

export class UploadImageFromBase64Error {
    readonly _tag = "UploadImageFromBase64Error"
}


export type UploadImageBlobError = UploadImageFromURLError | FetchImageURLError | UploadImageFromBase64Error


export function uploadImageBlob(agent: SessionAgent, image: ImagePayloadForPostCreation): Effect.Effect<UploadedImage, UploadImageBlobError> {
    if (image.$type == "url") {
        return uploadImageSrcBlob(agent, image.src)
    } else {
        return uploadBase64Blob(agent, image.base64)
    }
}

