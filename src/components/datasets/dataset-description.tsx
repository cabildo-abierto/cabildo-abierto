import ReadOnlyEditor from "../editor/read-only-editor";


export const DatasetDescription = ({description}: {description: string}) => {
    if(!description || description.length > 0) return "Sin descripción."
    return <ReadOnlyEditor text={description} format={"markdown"}/>
}