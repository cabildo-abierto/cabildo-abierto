"use client"
import { useUser } from "../hooks/user"
import { TopicProps } from "../app/lib/definitions"
import InfoPanel from "./info-panel"
import { PermissionLevel } from "./permission-level"



export const NotEnoughPermissionsWarning = ({entity}: {entity: TopicProps}) => {
    const user = useUser()

    const status = user.user.editorStatus
    const info = <div className="">
        <p>Tu nivel de permisos de edición es <PermissionLevel level={status}/> y este tema requiere nivel <PermissionLevel level={entity.protection}/>.</p>
        <p>Al quedar pendiente de confirmación otros usuarios la pueden ver y comentar, pero no es la versión oficial del tema hasta que la acepte un editor con suficientes permisos y no va a aparecer por defecto.</p>
    </div>
    return <div className="">
        Tu edición va a quedar pendiente de confirmación. <InfoPanel text={info}/>
    </div>
}