import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api";

type BaseProfileObjective = {
    id: string
    label: string
    completed: boolean
}

export type ProfileMission = BaseProfileObjective & {
    progress: number
    objective: number
    detail?: string
}

function getBaseProfileObjectives(profile: ArCabildoabiertoActorDefs.ProfileViewDetailed): BaseProfileObjective[] {
    return [
        {
            id: "display-name",
            label: "Agregá un nombre",
            completed: Boolean(profile.displayName),
        },
        {
            id: "avatar",
            label: "Agregá una foto de perfil",
            completed: Boolean(profile.avatar),
        },
        {
            id: "description",
            label: "Agregá una descripción",
            completed: Boolean(profile.description && profile.description.length > 0),
        },
        {
            id: "banner",
            label: "Agregá una foto de portada",
            completed: Boolean(profile.banner),
        }
    ]
}

export function getProfileMissions(profile: ArCabildoabiertoActorDefs.ProfileViewDetailed): ProfileMission[] {
    const objectives = getBaseProfileObjectives(profile)
    const completedCount = objectives.filter(objective => objective.completed).length

    return [
        {
            id: "complete-profile",
            label: "Completá tu perfil",
            progress: completedCount,
            objective: objectives.length,
            detail: `${completedCount}/${objectives.length}`,
            completed: completedCount === objectives.length,
        },
        ...objectives.map(objective => ({
            ...objective,
            progress: objective.completed ? 1 : 0,
            objective: 1,
            detail: `${objective.completed ? 1 : 0}/1`,
        }))
    ]
}

export function getPendingProfileObjectiveLabels(profile: ArCabildoabiertoActorDefs.ProfileViewDetailed): string[] {
    return getBaseProfileObjectives(profile)
        .filter(objective => !objective.completed)
        .map(objective => objective.label)
}
