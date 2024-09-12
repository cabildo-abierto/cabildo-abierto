import PostEditor from "../../../components/editor/post-editor";
import { ContentProps } from "../../lib/definitions";


export default function EditDraftPage({content}: {content: ContentProps}) {

    return <PostEditor
        initialData={content.text}
        initialTitle={content.title ? content.title : undefined}
        isFast={content.type == "FastPost"}
        isDraft={true}
        contentId={content.id}
    />
}