import SelectionComponent from "../../buscar/search-selection-component"
import {FeedConfig} from "../config/feed-config";
import {mainFeedOptionToSearchParam} from "../config/defaults";
import {feedOptionNodes} from "../config/feed-option-nodes";
import {MainFeedOption} from "@/lib/types";
import {useMainPageSelected} from "./main-page";
import {useSession} from "@/components/auth/use-session";
import {updateSearchParam} from "@/components/utils/react/search-params";


export const MainFeedHeader = () => {
    const {user} = useSession()
    const selected = useMainPageSelected(user)

    function onSelection(v: MainFeedOption) {
        updateSearchParam("f", mainFeedOptionToSearchParam(v))
    }

    return <div className="flex justify-between items-center max-w-screen overflow-x-auto no-scrollbar w-full h-full pr-2">
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