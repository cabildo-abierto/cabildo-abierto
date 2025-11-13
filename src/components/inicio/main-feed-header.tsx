import SelectionComponent from "@/components/buscar/search-selection-component"
import {FeedConfig} from "@/components/feed/config/feed-config";
import {mainFeedOptionToSearchParam} from "@/components/feed/config/defaults";
import {feedOptionNodes} from "@/components/feed/config/feed-option-nodes";
import {MainFeedOption} from "@/lib/types";
import {updateSearchParam} from "@/utils/fetch";
import {useMainPageSelected} from "@/components/inicio/main-page";
import {useSession} from "@/queries/getters/useSession";


export const MainFeedHeader = () => {
    const {user} = useSession()
    const selected = useMainPageSelected(user)

    function onSelection(v: MainFeedOption) {
        updateSearchParam("f", mainFeedOptionToSearchParam(v))
    }

    return <div className="flex justify-between items-center h-full w-full pr-2">
        <SelectionComponent<MainFeedOption>
            onSelection={onSelection}
            options={["Siguiendo", "En discusión", "Descubrir"]}
            selected={selected}
            optionsNodes={feedOptionNodes(47, mainFeedOptionToSearchParam)}
            className="flex"
        />
        <FeedConfig selected={selected}/>
    </div>
}