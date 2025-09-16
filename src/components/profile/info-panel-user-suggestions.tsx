import {followSuggestionsInfo} from "@/components/layout/follow-suggestions";
import {topicUrl} from "@/utils/uri";
import InfoPanel from "../../../modules/ui-utils/src/info-panel";
import React from "react";


export const InfoPanelUserSuggestions = () => {
    return <InfoPanel text={followSuggestionsInfo} moreInfoHref={topicUrl("Cabildo Abierto: Cuentas para seguir", undefined, "normal")}/>
}