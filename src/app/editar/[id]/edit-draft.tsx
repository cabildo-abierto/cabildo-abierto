import { ContentProps } from "src/app/lib/definitions";
import PostEditor from "src/components/editor/post-editor";


export default function EditDraftPage({content}: {content: ContentProps}) {

    return <PostEditor
        initialData={content.text}
        initialTitle={content.title ? content.title : undefined}
        isFast={content.type == "FastPost"}
        isDraft={true}
        contentId={content.id}
    />
}