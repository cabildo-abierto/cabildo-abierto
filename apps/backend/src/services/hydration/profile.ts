import {Dataplane} from "#/services/hydration/dataplane.js";
import {AppContext} from "#/setup.js";
import {ArCabildoabiertoActorDefs, EditorStatus} from "@cabildo-abierto/api"


export function hydrateProfileView(ctx: AppContext, did: string, data: Dataplane): ArCabildoabiertoActorDefs.ProfileView | null {
    const profile = data.profiles?.get(did)
    const viewer = data.profileViewers?.get(did)

    if(profile && viewer) {
        return {
            ...profile,
            viewer,
            $type: "ar.cabildoabierto.actor.defs#profileView"
        }
    }

    const ca = data.caUsers?.get(did)

    if(ca && ca != "not-found") {
        return {
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
    }

    const caDetailed = data.caUsersDetailed?.get(did)
    const bsky = data.bskyBasicUsers?.get(did)

    if(!bsky) {
        ctx.logger.pino.error({did, bsky: bsky != null, ca: caDetailed != null}, "data not found during profile view basic hydration")
        return null
    }

    return {
        ...bsky,
        caProfile: caDetailed && caDetailed != "not-found" && caDetailed.caProfile ? caDetailed.caProfile : undefined,
        verification: caDetailed && caDetailed != "not-found" && caDetailed.verification ? caDetailed.verification : undefined,
        viewer: bsky.viewer,
        $type: "ar.cabildoabierto.actor.defs#profileView"
    }
}


// Requiere:
// - profile y viewer o,
// - caBasic y viewer o,
// - caUsersDetailed y bskyBasicUser
export function hydrateProfileViewBasic(ctx: AppContext, did: string, data: Dataplane, warn: boolean = true): ArCabildoabiertoActorDefs.ProfileViewBasic | null {
    const profile = data.profiles?.get(did)
    const viewer = data.profileViewers?.get(did)

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

    const caBasic = data.caUsers?.get(did)

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

    const ca = data.caUsersDetailed?.get(did)
    const bsky = data.bskyBasicUsers?.get(did)

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


export function hydrateProfileViewDetailed(ctx: AppContext, did: string, dataplane: Dataplane): ArCabildoabiertoActorDefs.ProfileViewDetailed | null {
    const profile = dataplane.profiles?.get(did)
    const viewer = dataplane.profileViewers?.get(did)

    if (!viewer) {
        ctx.logger.pino.error({did}, "viewer data for profile view not found in hydration")
        return null
    }

    if (profile) {
        return {
            ...profile,
            viewer
        }
    }

    const caProfile = dataplane.caUsersDetailed.get(did)
    const bskyProfile = dataplane.bskyDetailedUsers.get(did)

    if (bskyProfile) {
        return {
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
    }

    ctx.logger.pino.error({did, caProfile: caProfile != null, bskyProfile: bskyProfile != null}, "data not found for profile view during hydration")

    return null
}