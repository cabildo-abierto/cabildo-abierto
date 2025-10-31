import {contentUrl, getRkeyFromUri} from "@/utils/uri";
import ShareIcon from "../icons/share-icon";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {toast} from "sonner";

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