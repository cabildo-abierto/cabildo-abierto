import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import {BaseButton} from "@/components/utils/base/base-button";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {cn} from "@/lib/utils";
import {useEffect, useRef} from "react";
import {PlusIcon} from "@phosphor-icons/react";
import Link from "next/link";
import {FeedConfig} from "@cabildo-abierto/api";
import {MainFeedHeaderButton} from "@/components/feed/feed/main-feed-header-button";


export function getFeedLabel(feed: FeedConfig) {
    if (feed.subtype == "siguiendo") {
        return "Siguiendo"
    } else if (feed.subtype == "descubrir") {
        return "Descubrir"
    } else if (feed.subtype == "discusion") {
        return "En discusión"
    } else if (feed.type == "topic") {
        return feed.title
    } else if (feed.type == "custom") {
        return feed.displayName
    } else {
        return "Muro desconocido"
    }
}


export const MainFeedHeader = () => {
    const {openFeeds, select} = useMainPageFeeds()
    const scrollRef = useRef<HTMLDivElement>(null)
    const barRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const scroller = scrollRef.current
        const bar = barRef.current
        if (!scroller || !bar) return

        let dragging = false
        let startX = 0
        let startScrollLeft = 0

        const updateThumb = () => {
            const maxScroll =
                scroller.scrollWidth - scroller.clientWidth

            if (maxScroll <= 0) {
                bar.style.transform = "translateX(0)"
                return
            }

            const ratio = scroller.scrollLeft / maxScroll
            const maxTranslate =
                scroller.clientWidth - bar.offsetWidth

            bar.style.transform = `translateX(${ratio * maxTranslate}px)`
        }

        const onPointerDown = (e: PointerEvent) => {
            dragging = true
            startX = e.clientX
            startScrollLeft = scroller.scrollLeft
            bar.setPointerCapture(e.pointerId)
            e.preventDefault()
        }

        const onPointerMove = (e: PointerEvent) => {
            if (!dragging) return

            const dx = e.clientX - startX
            const scrollRatio =
                scroller.scrollWidth / scroller.clientWidth

            scroller.scrollLeft = startScrollLeft + dx * scrollRatio
        }

        const onPointerUp = (e: PointerEvent) => {
            dragging = false
            bar.releasePointerCapture(e.pointerId)
        }

        bar.addEventListener("pointerdown", onPointerDown)
        bar.addEventListener("pointermove", onPointerMove)
        bar.addEventListener("pointerup", onPointerUp)
        bar.addEventListener("pointercancel", onPointerUp)

        scroller.addEventListener("scroll", updateThumb)
        updateThumb()

        return () => {
            scroller.removeEventListener("scroll", updateThumb)
            bar.removeEventListener("pointerdown", onPointerDown)
            bar.removeEventListener("pointermove", onPointerMove)
            bar.removeEventListener("pointerup", onPointerUp)
            bar.removeEventListener("pointercancel", onPointerUp)
        }
    }, [])

    return (
        <div className="relative w-full flex justify-between items-center space-x-2">
            <div className="tabs-scrollbar">
                <div ref={barRef} className="tabs-scrollbar-thumb"/>
            </div>
            <div
                ref={scrollRef}
                className="no-select flex-1 flex items-center flex-nowrap overflow-x-auto no-scrollbar pr-2"
            >
                {openFeeds.tabs.map((f, i) => {
                    return <MainFeedHeaderButton
                        key={i}
                        index={i}
                    />
                })}
            </div>
            <div>
                <Link href={"/inicio/feeds"}>
                    <BaseIconButton>
                        <PlusIcon/>
                    </BaseIconButton>
                </Link>
            </div>
        </div>
    )
}
