"use client"


import {useAPI} from "@/components/utils/react/queries";
import {PendingModeration} from "@cabildo-abierto/api";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";

function usePendingModeration() {
    return useAPI<PendingModeration>("/pending-moderation", ["pending-moderation"])
}


export default function Page() {
    const {data, isLoading} = usePendingModeration()

    if(isLoading) return <div>
        <LoadingSpinner/>
    </div>

    return <div className={"flex flex-col space-y-8 items-center"}>
        {data.contents.map(e => {
            return <div key={e.uri}>
                {e.uri}
            </div>
        })}
    </div>
}