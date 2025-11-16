import {followSuggestionsInfo} from "../layout/main-layout/right-panel/follow-suggestions";
import {topicUrl} from "@/components/utils/react/url";
import InfoPanel from "@/components/utils/base/info-panel";
import React from "react";


export const InfoPanelUserSuggestions = () => {
    return <InfoPanel
        text={followSuggestionsInfo}
        moreInfoHref={topicUrl("Cabildo Abierto: Cuentas para seguir")}
    />
}