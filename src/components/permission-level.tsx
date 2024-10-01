import { permissionToPrintable } from "./utils"



export const PermissionLevel = ({level}: {level: string}) => {
    return <span className="text-[var(--primary)]">
        {permissionToPrintable(level)}
    </span>
}