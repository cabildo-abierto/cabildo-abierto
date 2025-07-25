import {permissionToPrintable} from "./utils";



export const PermissionLevel = ({level, className="text-[var(--primary)]"}: {level: string, className?: string}) => {
    return <span className={className}>
        {permissionToPrintable(level)}
    </span>
}