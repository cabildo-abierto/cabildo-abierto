"use client"
import InfoPanel from "@/components/utils/base/info-panel"
import { PermissionLevel } from "./permission-level"
import {useSession} from "@/components/auth/use-session";
import {getTopicProtection} from "./utils";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"


export const NotEnoughPermissionsWarning = ({topic}: {topic: ArCabildoabiertoWikiTopicVersion.TopicView}) => {
    const {user} = useSession()

    const status = user?.editorStatus
    const info = <div className="">
        <p>Tu nivel de permisos de edición es <PermissionLevel level={status}/> y este tema requiere nivel <PermissionLevel level={getTopicProtection(topic.props)}/>.</p>
        <p>Al quedar pendiente de confirmación otros usuarios la pueden ver y comentar, pero no es la versión oficial del tema hasta que la acepte un editor con suficientes permisos y no va a aparecer por defecto.</p>
    </div>

    return <div className="flex space-x-1">
        <div>
            Tu edición va a quedar pendiente de confirmación.
        </div>
        <div>
            <InfoPanel text={info}/>
        </div>
    </div>
}