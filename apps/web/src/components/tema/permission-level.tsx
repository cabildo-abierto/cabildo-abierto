


export const PermissionLevel = ({level, className=""}: {level: string, className?: string}) => {
    return <span className={className}>
        {level == "Beginner" && "Editor principiante"}
        {level == "Administrator" && "Administrador"}
        {!["Beginner", "Administrator"].includes(level) && level}
    </span>
}