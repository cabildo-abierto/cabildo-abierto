import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api";

type BaseProfileObjective = {
    id: string
    label: string
    completed: boolean
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

export function getPendingProfileObjectiveLabels(profile: ArCabildoabiertoActorDefs.ProfileViewDetailed): string[] {
    return getBaseProfileObjectives(profile)
        .filter(objective => !objective.completed)
        .map(objective => objective.label)
}
