import {DataPlane} from "#/services/hydration/dataplane.js";
import {AppContext} from "#/setup.js";
import {ArCabildoabiertoActorDefs, EditorStatus} from "@cabildo-abierto/api"
import {Effect} from "effect";


export function hydrateProfileView(ctx: AppContext, did: string): Effect.Effect<ArCabildoabiertoActorDefs.ProfileView | null, never, DataPlane> {
    return Effect.gen(function* () {
        const dataplane = yield* DataPlane
        const data = dataplane.getState()
        const profile = data.profiles?.get(did)
        const viewer = data.profileViewers?.get(did)

        if(profile && viewer) {
            const res: ArCabildoabiertoActorDefs.ProfileView = {
                ...profile,
                viewer,
                $type: "ar.cabildoabierto.actor.defs#profileView"
            }
            return res
        }

        const ca = data.caUsers?.get(did)

        if(ca && ca != "not-found") {
            const res: ArCabildoabiertoActorDefs.ProfileView = {
                viewer: {
                    $type: "app.bsky.actor.defs#viewerState",
                    following: ca.viewer.following ?? undefined,
                    followedBy: ca.viewer.followedBy ?? undefined
                },
                did: ca.did,
                handle: ca.handle,
                displayName: ca.displayName ?? undefined,
                createdAt: ca.createdAt.toISOString(),
                avatar: ca.avatar ?? undefined,
                caProfile: ca.caProfile ?? undefined,
                verification: ca.verification ?? undefined,
                editorStatus: ca.editorStatus,
                description: ca.description ?? undefined,
                $type: "ar.cabildoabierto.actor.defs#profileView"
            }
            return res
        }

        const caDetailed = data.caUsersDetailed?.get(did)
        const bsky = data.bskyBasicUsers?.get(did) ?? data.bskyDetailedUsers?.get(did)

        yield* Effect.annotateCurrentSpan({
            bsky: bsky != null, caDetailed: caDetailed != null
        })

        if(!bsky) {
            return null
        }

        const res: ArCabildoabiertoActorDefs.ProfileView = {
            ...bsky,
            caProfile: caDetailed && caDetailed != "not-found" && caDetailed.caProfile ? caDetailed.caProfile : undefined,
            verification: caDetailed && caDetailed != "not-found" && caDetailed.verification ? caDetailed.verification : undefined,
            viewer: bsky.viewer,
            $type: "ar.cabildoabierto.actor.defs#profileView"
        }
        return res
    }).pipe(Effect.withSpan("hydrateProfileView", {attributes: {did}}))
}


// Requiere:
// - profile y viewer o,
// - caBasic y viewer o,
// - caUsersDetailed y bskyBasicUser
export function hydrateProfileViewBasic(ctx: AppContext, did: string, warn: boolean = true): Effect.Effect<ArCabildoabiertoActorDefs.ProfileViewBasic | null, never, DataPlane> {
    return Effect.gen(function* () {
        const data = yield* DataPlane
        const state = data.getState()
        const profile = state.profiles?.get(did)
        const viewer = state.profileViewers?.get(did)

        if(profile && viewer) {
            return {
                did: profile.did,
                handle: profile.handle,
                displayName: profile.displayName,
                avatar: profile.avatar,
                associated: profile.associated,
                labels: profile.labels,
                createdAt: profile.createdAt,
                caProfile: profile.caProfile,
                verification: profile.verification,
                editorStatus: profile.editorStatus,
                viewer,
                $type: "ar.cabildoabierto.actor.defs#profileViewBasic"
            }
        }

        const caBasic = state.caUsers?.get(did)

        if(caBasic && caBasic != "not-found") {
            return {
                did: caBasic.did,
                handle: caBasic.handle,
                displayName: caBasic.displayName ?? undefined,
                createdAt: caBasic.createdAt.toISOString(),
                avatar: caBasic.avatar ?? undefined,
                caProfile: caBasic.caProfile ?? undefined,
                verification: caBasic.verification ?? undefined,
                editorStatus: editorStatusToDisplay(caBasic?.editorStatus),
                viewer: {
                    following: caBasic.viewer.following ?? undefined,
                    followedBy: caBasic.viewer.followedBy ?? undefined
                },
                $type: "ar.cabildoabierto.actor.defs#profileViewBasic"
            }
        }

        const ca = state.caUsersDetailed?.get(did)
        const bsky = state.bskyBasicUsers?.get(did) ?? state.bskyDetailedUsers?.get(did)

        if(!bsky) {
            if(warn) {
                ctx.logger.pino.warn({did, bsky: bsky != null, ca: ca != null}, "data not found during profile view basic hydration")
            }
            return null
        }

        return {
            ...bsky,
            caProfile: ca && ca != "not-found" && ca.caProfile ? ca.caProfile : undefined,
            verification: ca && ca != "not-found" && ca.verification ? ca.verification : undefined,
            editorStatus: ca && ca != "not-found" && ca.editorStatus ? editorStatusToDisplay(ca.editorStatus) : undefined,
            viewer: bsky.viewer,
            $type: "ar.cabildoabierto.actor.defs#profileViewBasic"
        }
    })
}


function editorStatusToDisplay(status: EditorStatus | undefined) {
    if(status == "Beginner"){
        return "Editor principiante"
    } else if(status == "Editor"){
        return "Editor"
    } else if(status == "Administrator"){
        return "Administrador"
    } else {
        return "Editor principiante"
    }
}


export class MissingProfileViewerDataError {
    readonly _tag = "MissingProfileViewerDataError"
}


export class MissingBskyProfileError {
    readonly _tag = "MissingBskyProfileError"
}


export const hydrateProfileViewDetailed = (ctx: AppContext, did: string): Effect.Effect<ArCabildoabiertoActorDefs.ProfileViewDetailed | null, MissingProfileViewerDataError | MissingBskyProfileError, DataPlane> => Effect.gen(function* () {
    const dataplane = yield* DataPlane
    const state = dataplane.getState()

    const profile = state.profiles?.get(did)
    const viewer = state.profileViewers?.get(did)

    if (!viewer) {
        return yield* Effect.fail(new MissingProfileViewerDataError())
    }

    if (profile) {
        return {
            ...profile,
            viewer
        }
    }

    const caProfile = state.caUsersDetailed.get(did)
    const bskyProfile = state.bskyDetailedUsers.get(did)

    if (bskyProfile) {
        const profile: ArCabildoabiertoActorDefs.ProfileViewDetailed = {
            ...bskyProfile,
            followersCount: caProfile != "not-found" ? (caProfile?.followersCount ?? undefined) : undefined,
            followsCount: caProfile != "not-found" ? (caProfile?.followsCount ?? undefined) : undefined,
            bskyFollowersCount: bskyProfile.followersCount,
            bskyFollowsCount: bskyProfile.followsCount,
            caProfile: caProfile != "not-found" ? (caProfile?.caProfile ?? undefined) : undefined,
            verification: caProfile != "not-found" ? (caProfile?.verification ?? undefined) : undefined,
            viewer: viewer,
            editorStatus: caProfile != "not-found" ? editorStatusToDisplay(caProfile?.editorStatus) : undefined,
            editsCount: caProfile != "not-found" ? (caProfile?.editsCount ?? 0) : undefined,
            articlesCount: caProfile != "not-found" ? (caProfile?.articlesCount ?? 0) : undefined,
            $type: "ar.cabildoabierto.actor.defs#profileViewDetailed"
        }
        return profile
    }

    return yield* Effect.fail(new MissingBskyProfileError())
}).pipe(
    Effect.withSpan("hydrateProfileViewDetailed"),
    Effect.catchTag("MissingProfileViewerDataError", () => Effect.succeed(null)),
    Effect.catchTag("MissingBskyProfileError", () => Effect.succeed(null))
)