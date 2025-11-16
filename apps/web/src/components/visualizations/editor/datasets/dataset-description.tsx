


export const DatasetDescription = ({description}: {description?: string}) => {
    if(!description || description.length == 0) return "Sin descripción."
    return <div className={"text-[var(--text)]"}>
        {description} {/* TO DO (!): Links */}
    </div>
}