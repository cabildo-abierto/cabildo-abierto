import {OptionsDropdownButton} from "@/components/layout/options/options-dropdown-button";
import BlueskyLogo from "@/components/layout/icons/bluesky-logo";
import {getBlueskyUrl, getCollectionFromUri, getRkeyFromUri, isPost} from "@/utils/uri";


export default function OptionsOpenInBlueskyButton({uri}: {uri: string}) {
    const isOptimistic = getRkeyFromUri(uri).startsWith("optimistic")
    const inBluesky = isPost(getCollectionFromUri(uri))
    return inBluesky && <OptionsDropdownButton
        text1={"Abrir en Bluesky"}
        startIcon={<BlueskyLogo className={"w-5 h-auto"}/>}
        handleClick={async () => {
            window.open(getBlueskyUrl(uri), "_blank")
            return {}
        }}
        disabled={isOptimistic}
    />
}