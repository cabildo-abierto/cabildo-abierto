import {MainPageFeedsState, useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {PlusIcon} from "@phosphor-icons/react";
import Link from "next/link";
import {FeedConfig} from "@cabildo-abierto/api";
import {MainFeedHeaderButton, MainFeedHeaderButtonPlaceholder} from "@/components/feed/feed/main-feed-header-button";
import {range} from "@cabildo-abierto/utils";
import {cn} from "@/lib/utils";


export function getFeedIndex(id: string, openFeeds: MainPageFeedsState) {
    const label = getFeedLabel(openFeeds.tabs.find(x => x.id == id).config)
    const sameLabel = openFeeds.tabs
        .filter(x => getFeedLabel(x.config) == label)
        .toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return sameLabel.findIndex(x => x.id == id)
}


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


type DragState = {
    id: string
    startX: number
    currentX: number
    width: number
    height: number
    originLeft: number
}


const EDGE_RATIO = 0.1
const MAX_SCROLL_SPEED = 18


export const MainFeedHeader = () => {
    const {openFeeds, setConfigOpen, reorderTabs} = useMainPageFeeds()
    const scrollRef = useRef<HTMLDivElement>(null)
    const barRef = useRef<HTMLDivElement>(null)
    const [drag, setDrag] = useState<DragState | null>(null)
    const tabRefs = useRef<HTMLDivElement[]>([])
    const autoScrollRaf = useRef<number | null>(null)
    const autoScrollSpeed = useRef(0)
    const prevRects = useRef<Map<string, DOMRect>>(new Map())

    useLayoutEffect(() => {
        tabRefs.current.forEach((el, i) => {
            const id = openFeeds.tabs[i].id
            const prev = prevRects.current.get(id)
            if (!prev) return

            const next = el.getBoundingClientRect()
            const dx = prev.left - next.left

            if (dx !== 0) {
                el.style.transform = `translateX(${dx}px)`
                el.style.transition = "transform 0s"

                requestAnimationFrame(() => {
                    el.style.transform = ""
                    el.style.transition = "transform 200ms cubic-bezier(.25,.8,.25,1)"
                })
            }
        })

        prevRects.current.clear()
    }, [openFeeds.tabs])

    function startAutoScroll() {
        if (autoScrollRaf.current != null) return

        const tick = () => {
            const scroller = scrollRef.current
            if (!scroller || autoScrollSpeed.current === 0) {
                autoScrollRaf.current = null
                return
            }

            scroller.scrollLeft += autoScrollSpeed.current
            autoScrollRaf.current = requestAnimationFrame(tick)
        }

        autoScrollRaf.current = requestAnimationFrame(tick)
    }

    function stopAutoScroll() {
        autoScrollSpeed.current = 0
        if (autoScrollRaf.current != null) {
            cancelAnimationFrame(autoScrollRaf.current)
            autoScrollRaf.current = null
        }
    }

    function startDrag(e: PointerEvent, id: string) {
        const rect = tabRefs.current[openFeeds.tabs.findIndex(t => t.id == id)].getBoundingClientRect()

        setDrag({
            id,
            startX: e.clientX,
            currentX: e.clientX,
            width: rect.width,
            height: rect.height,
            originLeft: rect.left
        })
    }

    useEffect(() => {
        if (!drag) return

        // al mover el mouse actualizamos currentX y el overIndex
        function onMove(e: PointerEvent) {
            const scroller = scrollRef.current
            if (!scroller) return

            const rect = scroller.getBoundingClientRect()
            const width = rect.width
            let x = Math.min(Math.max(0, e.clientX - rect.left), width)

            const leftEdge = width * EDGE_RATIO
            const rightEdge = width * (1 - EDGE_RATIO)

            let intensity = 0

            if (x < leftEdge && scroller.scrollLeft > 0) {
                intensity = 1 - x / leftEdge
                intensity = Math.min(1, Math.pow(intensity, 0.75))
                autoScrollSpeed.current = -intensity * MAX_SCROLL_SPEED
                startAutoScroll()
            } else if (
                x > rightEdge &&
                scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth
            ) {
                intensity = (x - rightEdge) / (width - rightEdge)
                intensity = Math.min(1, Math.pow(intensity, 0.75))
                autoScrollSpeed.current = intensity * MAX_SCROLL_SPEED
                startAutoScroll()
            } else {
                stopAutoScroll()
            }

            const centers = tabRefs.current.map((t, i) => {
                let curCenter: number
                const isDragged = openFeeds.tabs[i].id == drag.id
                if (!isDragged) {
                    const r = t.getBoundingClientRect()
                    curCenter = r.left + r.width / 2
                } else {
                    curCenter = e.clientX
                }
                return { x: curCenter, index: i, isDragged}
            }).sort((a, b) => a.x - b.x)

            tabRefs.current.forEach((el, i) => {
                const id = openFeeds.tabs[i].id
                prevRects.current.set(id, el.getBoundingClientRect())
            })
            reorderTabs(centers.map(c => c.index))

            setDrag(d => d && {
                ...d,
                currentX: e.clientX,
                index: centers.findIndex(x => x.isDragged)
            })
        }

        // cuando se suelta el mouse, reordenamos si corresponde y eliminamos el drag
        function onUp() {
            stopAutoScroll()
            setDrag(null)
        }

        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)

        return () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
        }
    }, [drag])

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

    if (openFeeds.tabs.length == 0) return <div className={"opacity-40"}>
        {range(3).map(i => {
            return <MainFeedHeaderButtonPlaceholder key={i} text={`Muro ${i + 1}`}/>
        })}
    </div>

    return (
        <div className="relative w-full flex justify-between items-center">
            <div className="tabs-scrollbar">
                <div ref={barRef} className="tabs-scrollbar-thumb"/>
            </div>
            <div
                ref={scrollRef}
                className="no-select flex items-center flex-nowrap overflow-x-auto no-scrollbar"
            >
                {openFeeds.tabs.map((f, i) => {
                    return <div
                        key={f.id}
                        ref={(el) => {
                            if (el) tabRefs.current[i] = el
                        }}
                        data-tab-id={f.id}
                        className={cn(drag?.id == f.id ? "opacity-10" : "")}
                    >
                        <MainFeedHeaderButton
                            id={f.id}
                            startDrag={startDrag}
                        />
                    </div>
                })}
            </div>
            {drag && (
                <div
                    style={{
                        position: "fixed",
                        top: tabRefs.current[openFeeds.tabs.findIndex(x => x.id == drag.id)].getBoundingClientRect().top,
                        left: Math.min(Math.max(scrollRef.current.getBoundingClientRect().left, drag.originLeft + (drag.currentX - drag.startX)), scrollRef.current.getBoundingClientRect().right - drag.width),
                        width: drag.width,
                        height: drag.height,
                        zIndex: 1000,
                        pointerEvents: "none"
                    }}
                >
                    <MainFeedHeaderButton id={drag.id}/>
                </div>
            )}
            <div className={"px-2 ml-2"}>
                <Link href={"/inicio/muros"} onClick={() => {
                    setConfigOpen(false)
                }}>
                    <BaseIconButton>
                        <PlusIcon/>
                    </BaseIconButton>
                </Link>
            </div>
        </div>
    )
}
