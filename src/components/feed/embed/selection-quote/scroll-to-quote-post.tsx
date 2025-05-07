import {Dispatch, ReactNode, SetStateAction, useEffect, useState} from "react";
import {smoothScrollTo} from "../../../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";

type ScrollToQuotePostProps = {
    children: ReactNode
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
}


export const ScrollToQuotePost = ({children, setPinnedReplies}: ScrollToQuotePostProps) => {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const hash = window.location.hash
        if (hash && !scrolled) {
            const cid = hash.split("#")[1]
            const scrollToElement = () => {
                const element = document.getElementById("selection:" + cid);
                if (element) {
                    setScrolled(true)
                    smoothScrollTo(element)
                    setPinnedReplies(prev => [...prev, cid])
                } else {
                    setTimeout(scrollToElement, 100)
                }
            };
            scrollToElement()
        }
    }, [setPinnedReplies, scrolled])

    return <>{children}</>
}