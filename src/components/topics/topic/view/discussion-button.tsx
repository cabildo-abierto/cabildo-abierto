import { BaseButton } from "@/components/layout/base/baseButton"
import { smoothScrollTo } from "@/components/layout/utils/scroll"
import { InactiveCommentIcon } from "@/components/layout/icons/inactive-comment-icon"
import { useState, useEffect } from 'react'

export const DiscussionButton = ({ replyCount }: { replyCount: number }) => {
    const [showButton, setShowButton] = useState(false)

    useEffect(() => {
        const target = document.getElementById("discusion")
        if (!target) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShowButton(false)
                } else {
                    if (entry.boundingClientRect.top < 0) {
                        setShowButton(false)
                    } else {
                        setShowButton(true)
                    }
                }
            },
            {
                rootMargin: "0px",
                threshold: 0.1
            }
        )

        observer.observe(target)

        return () => {
            if (target) {
                observer.unobserve(target)
            }
        }
    }, [])

    return showButton && <div
        className={"fixed bottom-2 left-4 text-[var(--text)] cursor-pointer"}
        onClick={() => {
            const target = document.getElementById("discusion")
            if (target) smoothScrollTo(target)
        }}
    >
        <BaseButton
            size={"small"}
            variant={"outlined"}
            startIcon={<div className={"pb-1"}><InactiveCommentIcon fontSize={18} /></div>}
        >
            <div className={"flex items-center space-x-2 font-light"}>
                Discusión ({replyCount})
            </div>
        </BaseButton>
    </div>
}