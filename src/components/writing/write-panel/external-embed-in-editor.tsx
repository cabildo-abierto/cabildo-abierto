import {PostExternalEmbed} from "@/components/feed/embed/post-external-embed";
import {CloseButton} from "../../../../modules/ui-utils/src/close-button";
import {AppBskyEmbedExternal} from "@atproto/api";

export const ExternalEmbedInEditor = ({embed, onRemove}: {
    embed: AppBskyEmbedExternal.View
    onRemove: () => void
}) => {
    return <div className={"relative mt-2"}>
        <div className={"absolute top-2 right-2"}>
            <CloseButton
                onClose={onRemove}
                size={"small"}
                color={"background-dark"}
            />
        </div>
        <PostExternalEmbed embed={embed}/>
    </div>
}