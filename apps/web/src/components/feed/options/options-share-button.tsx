import {contentUrl} from "@/components/utils/react/url";
import ShareIcon from "@/components/utils/icons/share-icon";
import {toast} from "sonner";
import {getRkeyFromUri} from "@cabildo-abierto/utils/dist";
import {DropdownMenuItem} from "@/components/utils/ui/dropdown-menu";

export const OptionsShareButton = ({uri, handle}: {uri: string, handle?: string}) => {

    const onShare = () => {
        try {
            const url = "https://www.cabildoabierto.ar" + contentUrl(uri, handle)

            navigator.clipboard.writeText(url).then(
                () => {
                    toast.success("¡Enlace copiado!")
                }
            )
            return {}
        } catch {
            return {error: "Error al copiar el link."}
        }
    };

    return <DropdownMenuItem
        onSelect={() => {onShare()}}
        disabled={getRkeyFromUri(uri) == "optimistic"}
    >
        <div>
            <ShareIcon fontSize={20}/>
        </div>
        <div className="whitespace-nowrap">
            Compartir
        </div>
    </DropdownMenuItem>
};