import { UserProps } from "../app/lib/definitions";
import { PermissionLevel } from "./editor/wiki-editor";



export const NoEditPermissionsMsg = ({user, level}: {user: UserProps, level: string}) => {
    return <span>Tenés permisos de <PermissionLevel level={user.editorStatus}/> y el artículo requiere permisos de <PermissionLevel level={level}/>.</span>
}