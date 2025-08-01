"use client"
import InfoPanel from "../../../../modules/ui-utils/src/info-panel"
import { PermissionLevel } from "./permission-level"
import {useSession} from "@/queries/useSession";
import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {getTopicProtection} from "@/components/topics/topic/utils";



export const NotEnoughPermissionsWarning = ({topic}: {topic: TopicView}) => {
    const user = useSession()

    const status = user.user.editorStatus
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