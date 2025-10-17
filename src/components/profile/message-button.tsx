import StateButton from "../../../modules/ui-utils/src/state-button";
import {useSession} from "@/queries/getters/useSession";
import {ArCabildoabiertoActorDefs} from "@/lex-api"
import {Button, darker} from "../../../modules/ui-utils/src/button";
import {AppBskyActorDefs} from "@atproto/api"
import {Color} from "../../../modules/ui-utils/src/color";
import MessagesIcon from "@/components/layout/icons/messages-icon";

export function MessageButton({
                                 handle,
                                 profile,
                                 backgroundColor="background",
                                 textClassName,
                                 dense=false
}: {
    handle: string,
    profile: AppBskyActorDefs.ProfileViewDetailed | AppBskyActorDefs.ProfileViewBasic | ArCabildoabiertoActorDefs.ProfileViewBasic | ArCabildoabiertoActorDefs.ProfileViewDetailed
    backgroundColor?: Color
    textClassName?: string
    dense?: boolean
}) {
    //const qc = useQueryClient()
    const {user} = useSession()
    //const {setLoginModalOpen} = useLoginModal()

    if (user && user.handle == handle) {
        return null
    }

    return <div className="flex items-center">
        {
            <Button
                color={darker(backgroundColor)}
                size="small"
                variant="outlined"
                startIcon={<MessagesIcon weight='light'/>}
                href={`/mensajes/${handle}`}>
                Mensaje
            </Button>
        }
    </div>
}