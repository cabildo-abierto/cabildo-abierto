import ReadOnlyEditor from "../editor/read-only-editor";


export const DatasetDescription = ({description}: {description: string}) => {
    return <ReadOnlyEditor text={description} format={"markdown"}/>
}