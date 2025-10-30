import ViewsIcon from "@/components/layout/icons/views-icon";
import ViewsDisabledIcon from "@/components/layout/icons/views-disabled-icon";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";


export default function OptionsBlueskyReactionsButton({
                                                          showBluesky,
                                                          setShowBluesky
                                                      }: {
    showBluesky: boolean;
    setShowBluesky?: (showBluesky: boolean) => void;
}) {
    if (!setShowBluesky) return null

    return <DropdownMenuItem
        onSelect={() => {
            setShowBluesky(!showBluesky)
        }}
    >
        <div>
            {!showBluesky ? <ViewsIcon fontSize={20}/> : <ViewsDisabledIcon fontSize={20}/>}
        </div>
        <div>
            Reacciones en Bluesky
        </div>
    </DropdownMenuItem>
}