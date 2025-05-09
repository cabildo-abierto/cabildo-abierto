import {View as ExternalEmbedView} from "@/lex-api/types/app/bsky/embed/external"
import {PostExternalEmbed} from "@/components/feed/embed/post-external-embed";
import {CloseButton} from "../../../../modules/ui-utils/src/close-button";


export const ExternalEmbedInEditor = ({embed, onRemove}: {embed: ExternalEmbedView, onRemove: () => void}) => {
    return <div className={"relative mt-2"}>
        <div className={"absolute top-2 right-2"}>
            <CloseButton
                onClose={onRemove}
                size={"small"}
                color={"accent"}
            />
        </div>
        <PostExternalEmbed embed={embed}/>
    </div>
}