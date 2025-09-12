import {MainPostFrame} from '../../thread/post/main-post-frame';
import {PostContent} from "./post-content";
import {
    isArticleView,
    isPostView,
    isThreadViewContent,
    PostView,
    ThreadViewContent
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {useEffect} from "react";
import {smoothScrollTo} from "../../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {$Typed} from "@atproto/api";
import FeedElement from "@/components/feed/feed/feed-element";
import {isTopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


function getThreadAncestors(t: ThreadViewContent): ThreadViewContent[] {
    const ancestors: ThreadViewContent[] = []
    while (t.parent && isThreadViewContent(t.parent)) {
        ancestors.push(t.parent)
        t = t.parent
    }
    return ancestors.reverse()
}


const PostThreadAncestors = ({threadViewContent}: { threadViewContent: ThreadViewContent }) => {
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
            if (isPostView(a.content) || isArticleView(a.content) || isTopicViewBasic(a.content)) {
                return <div className="w-full" key={isPostView(a.content) || isArticleView(a.content) ? a.content.uri : a.content.id}>
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


export const Post = ({threadViewContent, postView}: { threadViewContent: ThreadViewContent, postView: $Typed<PostView> }) => {

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