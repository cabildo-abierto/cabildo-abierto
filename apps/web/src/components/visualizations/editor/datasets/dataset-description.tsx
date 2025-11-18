import {ReadOnlyEditor} from "@/components/utils/base/read-only-editor";


export const DatasetDescription = ({description}: {description?: string}) => {
    if(!description || description.length == 0) return "Sin descripción."
    return <div className={"text-[var(--text)]"}>
        <ReadOnlyEditor text={description}/>
    </div>
}