
import {FastPostProps} from '@/lib/definitions'
import { MainPostFrame } from './main-post-frame';
import {PostContent} from "./post-content";


export const FastPost = ({post}: { post: FastPostProps }) => {

    return <MainPostFrame post={post}>
        <PostContent
            post={post}
            isMainPost={true}
            showQuoteContext={true}
        />
    </MainPostFrame>
}