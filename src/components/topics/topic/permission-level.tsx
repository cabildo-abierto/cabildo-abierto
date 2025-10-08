


export const PermissionLevel = ({level, className="text-[var(--primary)]"}: {level: string, className?: string}) => {
    return <span className={className}>
        {level}
    </span>
}