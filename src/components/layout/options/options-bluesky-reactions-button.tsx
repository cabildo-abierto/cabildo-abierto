import {OptionsDropdownButton} from "@/components/layout/options/options-dropdown-button";
import ViewsIcon from "@/components/layout/icons/views-icon";
import ViewsDisabledIcon from "@/components/layout/icons/views-disabled-icon";


export default function OptionsBlueskyReactionsButton({
    showBluesky,
    setShowBluesky
                                                      }: {
    showBluesky: boolean;
    setShowBluesky?: (showBluesky: boolean) => void;
}) {
    return setShowBluesky &&
    <OptionsDropdownButton
        text1={"Reacciones en Bluesky"}
        handleClick={async () => {setShowBluesky(!showBluesky); return {}}}
        startIcon={!showBluesky ? <ViewsIcon/> : <ViewsDisabledIcon/>}
    />
}