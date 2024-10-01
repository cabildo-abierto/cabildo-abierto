import { decompress } from "../../../components/compression";
import PostEditor from "../../../components/editor/post-editor";
import { ContentProps } from "../../lib/definitions";


export default function EditDraftPage({content}: {content: ContentProps}) {

    return <PostEditor
        initialData={decompress(content.compressedText)}
        initialTitle={content.title ? content.title : undefined}
        isFast={content.type == "FastPost"}
        isDraft={true}
        contentId={content.id}
    />
}