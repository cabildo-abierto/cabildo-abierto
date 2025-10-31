import BlueskyLogo from "@/components/layout/icons/bluesky-logo";
import {getBlueskyUrl, getCollectionFromUri, getRkeyFromUri, isPost} from "@/utils/uri";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";


export default function OptionsOpenInBlueskyButton({uri}: {uri: string}) {
    const isOptimistic = getRkeyFromUri(uri).startsWith("optimistic")
    const inBluesky = isPost(getCollectionFromUri(uri))
    if(!inBluesky) return null

    return <DropdownMenuItem
        onSelect={() => {
            window.open(getBlueskyUrl(uri), "_blank")
            return {}
        }}
        disabled={isOptimistic}
    >
        <div>
            <BlueskyLogo className={"w-5 h-auto"}/>
        </div>
        <div>
            Abrir en Bluesky
        </div>
    </DropdownMenuItem>
}