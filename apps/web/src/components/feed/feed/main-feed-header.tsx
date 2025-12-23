import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {useEffect, useRef} from "react";
import {PlusIcon} from "@phosphor-icons/react";
import Link from "next/link";
import {FeedConfig} from "@cabildo-abierto/api";
import {MainFeedHeaderButton, MainFeedHeaderButtonPlaceholder} from "@/components/feed/feed/main-feed-header-button";
import {range} from "@cabildo-abierto/utils";


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
    const {openFeeds, setConfigOpen} = useMainPageFeeds()
    const scrollRef = useRef<HTMLDivElement>(null)
    const barRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const scroller = scrollRef.current
        if (!scroller) return

        const updateOverflowClass = () => {
            scroller.parentElement!.classList.toggle(
                "has-x-overflow",
                scroller.scrollWidth > scroller.clientWidth
            )
        }

        updateOverflowClass()

        window.addEventListener("resize", updateOverflowClass)
        scroller.addEventListener("scroll", updateOverflowClass)

        const ro = new ResizeObserver(updateOverflowClass)
        ro.observe(scroller)

        return () => {
            window.removeEventListener("resize", updateOverflowClass)
            scroller.removeEventListener("scroll", updateOverflowClass)
            ro.disconnect()
        }
    }, [openFeeds])

    useEffect(() => {
        const scroller = scrollRef.current
        const bar = barRef.current
        if (!scroller || !bar) return

        let dragging = false
        let startX = 0
        let startScrollLeft = 0

        const updateThumb = () => {
            const scrollWidth = scroller.scrollWidth
            const clientWidth = scroller.clientWidth
            const maxScroll = scrollWidth - clientWidth

            if (maxScroll <= 0) {
                bar.style.transform = "translateX(0)"
                bar.style.width = "100%"
                return
            }

            const thumbRatio = clientWidth / scrollWidth
            const trackWidth = clientWidth
            const thumbWidth = Math.max(20, trackWidth * thumbRatio)

            bar.style.width = `${thumbWidth}px`

            const ratio = scroller.scrollLeft / maxScroll
            const maxTranslate = trackWidth - thumbWidth

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
    }, [openFeeds.tabs])

    if(openFeeds.tabs.length == 0) return <div className={"opacity-40"}>
        {range(3).map(i => {
            return <MainFeedHeaderButtonPlaceholder key={i} text={`Muro ${i+1}`}/>
        })}
    </div>

    return (
        <div className="relative w-full flex justify-between items-center">
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
            <div className={"px-2"}>
                <Link href={"/inicio/muros"} onClick={() => {setConfigOpen(false)}}>
                    <BaseIconButton>
                        <PlusIcon/>
                    </BaseIconButton>
                </Link>
            </div>
        </div>
    )
}
