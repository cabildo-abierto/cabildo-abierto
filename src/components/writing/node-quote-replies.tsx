import {ShowQuoteReplyButton} from "./show-quote-reply";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {LexicalEditor} from "lexical";
import {ReplyToContent} from "@/components/writing/write-panel/write-panel";
import {ArCabildoabiertoFeedDefs} from "@/lex-api"


export const NodeQuoteReplies = ({
     editor, replies, pinnedReplies, setPinnedReplies, leftCoordinates, parentContent
}: {
    replies: ArCabildoabiertoFeedDefs.PostView[]
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
    editor: LexicalEditor
    leftCoordinates: number
    parentContent: ReplyToContent
}) => {
    const [style, setStyle] = useState({})
    const [foundReply, setFoundReply] = useState(false)

    useEffect(() => {
        const updatePosition = () => {
            if (!replies || replies.length == 0) return;
            const element = document.getElementById(replies[0].uri);
            if (element) {
                const rect = element.getBoundingClientRect();
                setStyle({
                    position: "absolute",
                    top: window.scrollY + rect.top,
                    left: leftCoordinates + 10,
                });
            }
        };

        if(replies.length == 0) return

        let observer: ResizeObserver | undefined;
        const targetElement = document.getElementById(replies[0].uri);

        if (targetElement) {
            setFoundReply(true);
            updatePosition();

            observer = new ResizeObserver(updatePosition);
            observer.observe(document.body);
        } else {
            const mutationObserver = new MutationObserver(() => {
                const newTarget = document.getElementById(replies[0].uri);
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


    if(!foundReply) {
        return null
    }
    return <div style={style} className={"flex gap-x-1 "}>
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
}