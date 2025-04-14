import ReadOnlyEditor from "@/components/editor/read-only-editor";


export const ProfileDescription = ({description, className=""}: {description: string, className?: string}) => {
    return <ReadOnlyEditor text={description} format={"plain-text"} editorClassName={className + " link"}/>
}