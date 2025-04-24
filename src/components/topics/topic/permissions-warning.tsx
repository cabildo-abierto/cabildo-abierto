"use client"
import { TopicProps } from "@/lib/types"
import InfoPanel from "../../../../modules/ui-utils/src/info-panel"
import { PermissionLevel } from "./permission-level"
import {useSession} from "@/hooks/api";



export const NotEnoughPermissionsWarning = ({entity}: {entity: TopicProps}) => {
    const user = useSession()

    const status = user.user.editorStatus
    const info = <div className="">
        <p>Tu nivel de permisos de edición es <PermissionLevel level={status}/> y este tema requiere nivel <PermissionLevel level={entity.protection}/>.</p>
        <p>Al quedar pendiente de confirmación otros usuarios la pueden ver y comentar, pero no es la versión oficial del tema hasta que la acepte un editor con suficientes permisos y no va a aparecer por defecto.</p>
    </div>
    return <div className="">
        Tu edición va a quedar pendiente de confirmación. <InfoPanel text={info}/>
    </div>
}