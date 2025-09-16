import SelectionComponent from "@/components/buscar/search-selection-component"
import {FeedConfig} from "@/components/config/feed-config";
import {mainFeedOptionToSearchParam, searchParamToMainFeedOption} from "@/components/config/defaults";
import {feedOptionNodes} from "@/components/config/feed-option-nodes";
import {MainFeedOption} from "@/lib/types";
import {updateSearchParam} from "@/utils/fetch";
import {useSearchParams} from "next/navigation";


export const MainFeedHeader = () => {
    const params = useSearchParams()
    const paramsFeed = params.get("f")
    const selected = paramsFeed ? searchParamToMainFeedOption(paramsFeed) : "Siguiendo"

    function onSelection(v: MainFeedOption) {
        updateSearchParam("f", mainFeedOptionToSearchParam(v))
    }

    return <div className="flex justify-between items-center h-full w-full">
        <SelectionComponent<MainFeedOption>
            onSelection={onSelection}
            options={["Siguiendo", "En discusión"]}
            selected={selected}
            optionsNodes={feedOptionNodes(47, mainFeedOptionToSearchParam)}
            className="flex"
        />
        <FeedConfig selected={selected}/>
    </div>
}