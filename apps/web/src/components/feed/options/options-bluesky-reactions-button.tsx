import ViewsIcon from "@/components/utils/icons/views-icon";
import ViewsDisabledIcon from "@/components/utils/icons/views-disabled-icon";
import {DropdownMenuItem} from "@/components/utils/ui/dropdown-menu";
import {useShowBsky} from "@/lib/hooks/show-bsky";


export default function OptionsBlueskyReactionsButton() {
    const {showBsky, setShowBsky} = useShowBsky()

    return <DropdownMenuItem
        onSelect={() => {
            setShowBsky(!showBsky)
        }}
    >
        <div>
            {!showBsky ? <ViewsIcon fontSize={20}/> : <ViewsDisabledIcon fontSize={20}/>}
        </div>
        <div>
            Reacciones en Bluesky
        </div>
    </DropdownMenuItem>
}