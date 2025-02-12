"use client"

import {FastPostProps} from '../../app/lib/definitions'
import { MainPostFrame } from './main-post-frame';
import {FastPostContent} from "./fast-post-content";
import {useRouter} from "next/navigation";
import {contentUrl} from "../utils";


export const FastPost = ({post}: { post: FastPostProps }) => {
    const router = useRouter()

    return <MainPostFrame post={post}>
        <FastPostContent post={post} isMainPost={true} showQuoteContext={true}/>
    </MainPostFrame>
}