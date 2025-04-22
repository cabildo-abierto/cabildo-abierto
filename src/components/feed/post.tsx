
import { MainPostFrame } from './main-post-frame';
import {PostContent} from "./post-content";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";


export const Post = ({postView}: { postView: PostView }) => {

    return <MainPostFrame postView={postView}>
        <PostContent
            postView={postView}
            isMainPost={true}
            showQuoteContext={true}
        />
    </MainPostFrame>
}