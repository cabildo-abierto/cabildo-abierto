"use client"

import {FastPostProps} from '../../app/lib/definitions'
import { MainPostFrame } from './main-post-frame';
import {FastPostContent} from "./fast-post-content";


export const FastPost = ({content}: { content: FastPostProps }) => {

    return <MainPostFrame post={content}>
        <FastPostContent post={content} isMainPost={true}/>
    </MainPostFrame>
}