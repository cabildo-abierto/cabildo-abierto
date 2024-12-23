import {ShowQuoteReplyButton} from "./show-quote-reply";
import {FastPostProps} from "../../../../app/lib/definitions";
import {useEffect, useState} from "react";
import {LexicalEditor} from "lexical";

type NodeQuoteRepliesProps = {
    replies: FastPostProps[]
    pinnedReplies: string[]
    setPinnedReplies: (v: string[]) => void
    editor: LexicalEditor
}


export const NodeQuoteReplies = ({editor, replies, pinnedReplies, setPinnedReplies}: NodeQuoteRepliesProps) => {
    const [style, setStyle] = useState({})
    const [foundReply, setFoundReply] = useState(false)

    useEffect(() => {
        const updatePosition = () => {
            const element = document.getElementById(replies[0].cid);
            if (element) {
                const rect = element.getBoundingClientRect();

                setStyle({
                    position: "absolute",
                    top: window.scrollY + rect.top,
                    left: rect.right + 30,
                });
            }
        };

        let observer;

        const targetElement = document.getElementById(replies[0].cid);
        if (targetElement) {
            setFoundReply(true);
            updatePosition();

            // Observe layout shifts for the entire document
            observer = new ResizeObserver(updatePosition);
            observer.observe(document.body); // Observe the body for changes
        } else {
            // Observe for DOM changes if target not found
            const mutationObserver = new MutationObserver(() => {
                const newTarget = document.getElementById(replies[0].cid);
                if (newTarget) {
                    setFoundReply(true);
                    updatePosition();

                    // Start observing layout changes once the target is found
                    observer = new ResizeObserver(updatePosition);
                    observer.observe(document.body);

                    mutationObserver.disconnect(); // Stop observing DOM changes
                }
            });

            mutationObserver.observe(document.body, { childList: true, subtree: true });
        }

        // Recalculate on window resize or scroll
        const handleResizeOrScroll = () => {
            updatePosition();
        };

        window.addEventListener("resize", handleResizeOrScroll);

        return () => {
            if (observer) observer.disconnect();
            window.removeEventListener("resize", handleResizeOrScroll);
        };
    }, [replies]);

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
                    />
                </div>
            })
        }
    </div>


    /*return <div key={index} className={"flex gap-x-1"}>{repliesCIDs.map((cid, index2) => {

        function setPinned(v: boolean) {
            if (v) setPinnedReplies([...pinnedReplies, cid])
            else setPinnedReplies(pinnedReplies.filter((x) => (x != cid)))
        }

        return createPortal(
            <div key={index2}>
                <ShowQuoteReplyButton
                    reply={quoteRepliesMap.get(cid)}
                    editor={editor}
                    pinned={pinnedReplies.includes(cid)}
                    setPinned={setPinned}
                />
            </div>
            , document.body)

    })
    }</div>*/
}