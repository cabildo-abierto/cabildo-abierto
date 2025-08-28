"use client"
import PageHeader from "../../../../../modules/ui-utils/src/page-header";
import InfoPanel from "../../../../../modules/ui-utils/src/info-panel";
import {followSuggestionsInfo} from "@/components/layout/follow-suggestions";
import {topicUrl} from "@/utils/uri";
import {FollowSuggestionsFeed} from "@/components/buscar/follow-suggestions-feed";

export default function Page() {
    return <div className={"pb-16"}>
        <PageHeader title={"Cuentas para seguir"} rightSide={<InfoPanel text={followSuggestionsInfo} moreInfoHref={topicUrl("Cabildo Abierto: Cuentas para seguir", undefined, "normal")}/>}/>
        <FollowSuggestionsFeed/>
    </div>
}