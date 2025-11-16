import {MainPostFrame} from './main-post-frame';
import {PostContent} from "./post-content";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"

import {useEffect} from "react";
import FeedElement from "../feed/feed-element";
import {$Typed} from "@cabildo-abierto/api";
import {smoothScrollTo} from "../../utils/react/scroll";


function getThreadAncestors(t: ArCabildoabiertoFeedDefs.ThreadViewContent): ArCabildoabiertoFeedDefs.ThreadViewContent[] {
    const ancestors: ArCabildoabiertoFeedDefs.ThreadViewContent[] = []
    while (t.parent && ArCabildoabiertoFeedDefs.isThreadViewContent(t.parent)) {
        ancestors.push(t.parent)
        t = t.parent
    }
    return ancestors.reverse()
}


const PostThreadAncestors = ({threadViewContent}: { threadViewContent: ArCabildoabiertoFeedDefs.ThreadViewContent }) => {
    const ancestors = getThreadAncestors(threadViewContent)

    useEffect(() => {
        async function scrollAfterDelay() {
            const target = document.getElementById("post")
            await new Promise(resolve => setTimeout(resolve, 100))
            //window.scrollTo(0, target.offsetTop-20)
            smoothScrollTo(target, 200)
        }

        if (ancestors.length > 0) {
            scrollAfterDelay()
        }
    }, [ancestors])

    return <div className={"mb-1 w-full"}>
        {ancestors.map((a, index) => {
            if (ArCabildoabiertoFeedDefs.isPostView(a.content) || ArCabildoabiertoFeedDefs.isArticleView(a.content) || ArCabildoabiertoWikiTopicVersion.isTopicViewBasic(a.content)) {
                return <div className="w-full" key={ArCabildoabiertoFeedDefs.isPostView(a.content) || ArCabildoabiertoFeedDefs.isArticleView(a.content) ? a.content.uri : a.content.id}>
                    <FeedElement
                        elem={{
                            $type: "ar.cabildoabierto.feed.defs#feedViewContent",
                            content: a.content
                        }}
                        showingParent={index > 0}
                        showingChildren={true}
                    />
                </div>
            }
        })}
    </div>
}


export default function Post({postView, threadViewContent}: {
    postView?: $Typed<ArCabildoabiertoFeedDefs.PostView>
    threadViewContent?: ArCabildoabiertoFeedDefs.ThreadViewContent
}) {
    if(!postView || !threadViewContent) return null
    return <div className={"w-full"}>
        <PostThreadAncestors threadViewContent={threadViewContent}/>
        <div id={"post"} className={"w-full"}>
            <MainPostFrame
                postView={postView}
            >
                <PostContent
                    postView={postView}
                    isMainPost={true}
                    showQuoteContext={true}
                />
            </MainPostFrame>
        </div>
    </div>
}