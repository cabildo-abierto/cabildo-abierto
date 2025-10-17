import {useSession} from "@/queries/getters/useSession";
import {ArCabildoabiertoActorDefs} from "@/lex-api"
import {AppBskyActorDefs} from "@atproto/api"
import MessagesIcon from "@/components/layout/icons/messages-icon";
import {Color} from "@/components/layout/utils/color";
import {Button, darker} from "@/components/layout/utils/button";

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

    const {user} = useSession()
    const profileAllowIncoming = profile.associated.chat? profile.associated.chat.allowIncoming : 'none';

    // Condiciones para que no se muestre el botón de msj:
    const notDisplayButton = !profileAllowIncoming ||                    // no tiene definido si recibir mensajes,
        !['all', 'following'].includes(profileAllowIncoming) ||                  // no tiene definido recibir mensajes de todos ni de sus seguidores,
        user && user.handle == handle ||                                         // el usuario de la session está mirando su propio perfil,
        profileAllowIncoming == 'following' && !profile.viewer?.following        // solo recibir mensajes de seguidores pero el usuario de la session no lo sigue.

    if (notDisplayButton) {
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