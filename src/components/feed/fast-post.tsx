
import {FastPostProps} from '../../app/lib/definitions'
import { MainPostFrame } from './main-post-frame';
import {FastPostContent} from "./fast-post-content";


export const FastPost = ({post}: { post: FastPostProps }) => {

    return <MainPostFrame post={post}>
        <FastPostContent
            post={post}
            isMainPost={true}
            showQuoteContext={true}
        />
    </MainPostFrame>
}