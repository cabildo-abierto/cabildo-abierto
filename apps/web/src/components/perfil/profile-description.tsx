import {ReadOnlyEditor} from "@/components/utils/base/read-only-editor";


export const ProfileDescription = ({
                                       description,
                                       className=""
}: {
    description: string,
    className?: string
}) => {
    if(!description || description.length === 0) return null
    return <div key={description} className={className}>
        <ReadOnlyEditor
            text={description}
        />
    </div>
}