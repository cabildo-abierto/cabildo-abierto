import {ShowQuoteReplyButton} from "./show-quote-reply";
import {FastPostProps} from "../../../../app/lib/definitions";
import {useEffect, useState} from "react";
import {LexicalEditor} from "lexical";
import {ReplyToContent} from "./index";



export const NodeQuoteReplies = ({
     editor, replies, pinnedReplies, setPinnedReplies, leftCoordinates, parentContent
}: {
    replies: FastPostProps[]
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
    editor: LexicalEditor
    leftCoordinates: number
    parentContent: ReplyToContent
}) => {
    const [style, setStyle] = useState({})
    const [foundReply, setFoundReply] = useState(false)

    useEffect(() => {
        const updatePosition = () => {
            if (replies.length === 0) return;
            const element = document.getElementById(replies[0].cid);
            if (element) {
                const rect = element.getBoundingClientRect();
                setStyle({
                    position: "absolute",
                    top: window.scrollY + rect.top,
                    left: leftCoordinates + 60,
                });
            }
        };

        let observer: ResizeObserver | undefined;
        const targetElement = document.getElementById(replies[0].cid);

        if (targetElement) {
            setFoundReply(true);
            updatePosition();

            observer = new ResizeObserver(updatePosition);
            observer.observe(document.body);
        } else {
            const mutationObserver = new MutationObserver(() => {
                const newTarget = document.getElementById(replies[0].cid);
                if (newTarget) {
                    setFoundReply(true);
                    updatePosition();

                    observer = new ResizeObserver(updatePosition);
                    observer.observe(document.body);

                    mutationObserver.disconnect();
                }
            });

            mutationObserver.observe(document.body, { childList: true, subtree: true });
        }

        const handleResizeOrScroll = () => {
            updatePosition();
        };

        window.addEventListener("resize", handleResizeOrScroll);
        window.addEventListener("scroll", handleResizeOrScroll, { passive: true });

        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", handleResizeOrScroll);
            window.removeEventListener("scroll", handleResizeOrScroll);
        };
    }, [replies, leftCoordinates]);


    if(!foundReply) return null
    return <div style={style} className={"flex gap-x-1"}>
        {
            replies.map((r, index) => {

                function setPinned(v: boolean) {
                    if (v) setPinnedReplies([r.cid]) // only one pin at a time
                    else setPinnedReplies(pinnedReplies.filter((x) => (x != r.cid)))
                }

                return <div key={index}>
                    <ShowQuoteReplyButton
                        reply={r}
                        editor={editor}
                        pinnedReplies={pinnedReplies}
                        setPinned={setPinned}
                        parentContent={parentContent}
                    />
                </div>
            })
        }
    </div>
}