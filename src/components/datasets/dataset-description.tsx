import ReadOnlyEditor from "../editor/read-only-editor";


export const DatasetDescription = ({description}: {description: string}) => {
    return <div>
        <ReadOnlyEditor initialData={description}/>
    </div>
}