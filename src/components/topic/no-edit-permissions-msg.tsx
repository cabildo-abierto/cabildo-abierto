import { UserProps } from "../../app/lib/definitions";
import { PermissionLevel } from "./permission-level";



export const NoEditPermissionsMsg = ({user, level}: {user: UserProps, level: string}) => {
    return <span>Tenés permisos de <PermissionLevel level={user.editorStatus}/> y el tema requiere permisos de <PermissionLevel level={level}/>.</span>
}