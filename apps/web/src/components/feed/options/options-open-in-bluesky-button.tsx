import BlueskyLogo from "@/components/utils/icons/bluesky-logo";
import {getCollectionFromUri, getRkeyFromUri, isPost} from "@cabildo-abierto/utils/dist/uri";
import {getBlueskyUrl} from "@/components/utils/react/url";
import {DropdownMenuItem} from "@/components/utils/ui/dropdown-menu";


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