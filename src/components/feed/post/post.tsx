import {MainPostFrame} from '../../thread/post/main-post-frame';
import {PostContent} from "./post-content";
import {
    isPostView,
    isThreadViewContent,
    PostView,
    ThreadViewContent
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {PostPreview} from "@/components/feed/post/post-preview";
import {useEffect} from "react";
import {smoothScrollTo} from "../../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {$Typed} from "@atproto/api";


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

    return <div className={"mb-1"}>
        {ancestors.map((a, index) => {
            if (isPostView(a.content)) {
                return <div key={a.content.uri}>
                    <PostPreview
                        postView={a.content}
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