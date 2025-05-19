import ReadOnlyEditor from "@/components/editor/read-only-editor";


const ProfileDescription = ({description, className=""}: {description: string, className?: string}) => {
    if(!description || description.length === 0) return null
    return <div key={description}>
        <ReadOnlyEditor text={description} format={"plain-text"} editorClassName={className + " link"}/>
    </div>
}


export default ProfileDescription