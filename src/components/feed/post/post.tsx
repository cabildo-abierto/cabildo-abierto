
import { MainPostFrame } from '../../thread/post/main-post-frame';
import {PostContent} from "./post-content";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {$Typed} from "@atproto/api";


export const Post = ({postView}: { postView: $Typed<PostView> }) => {

    return <MainPostFrame postView={postView}>
        <PostContent
            postView={postView}
            isMainPost={true}
            showQuoteContext={true}
        />
    </MainPostFrame>
}