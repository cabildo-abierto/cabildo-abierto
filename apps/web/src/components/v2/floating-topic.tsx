"use client"

import {type PointerEvent, useRef} from "react";
import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {CloseButton} from "@/components/utils/base/close-button";
import {cn} from "@/lib/utils";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {getTopicTitle} from "@/components/tema/utils";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import Link from "next/link";
import {CornersOutIcon} from "@phosphor-icons/react";
import {ContentContextRef} from "@cabildo-abierto/utils";
import {ContentContextProvider} from "@/components/layout/contexts/content-context";
import {TopicContent} from "@/components/tema/view/topic-content";

export const minFloatingTopicWidth = 240
export const minFloatingTopicHeight = 180
export const defaultFloatingTopicWidth = 500
export const defaultFloatingTopicHeight = 600
const floatingTopicZIndexBase = 0
const maxOpenFloatingTopics = 100
const floatingTopicOpenOffset = 12
const floatingTopicViewportPadding = 8

export const getTopicPageHref = (topicId: string) => `/v2/tema?i=${encodeURIComponent(topicId)}`

export type OpenTopic = {
    topicId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
}

type ResizeDirection = "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left"

const resizeHandles: {direction: ResizeDirection, className: string}[] = [
    {direction: "top", className: "top-[-4px] left-2 right-2 h-2 cursor-ns-resize"},
    {direction: "right", className: "right-[-4px] top-2 bottom-2 w-2 cursor-ew-resize"},
    {direction: "bottom", className: "bottom-[-4px] left-2 right-2 h-2 cursor-ns-resize"},
    {direction: "left", className: "left-[-4px] top-2 bottom-2 w-2 cursor-ew-resize"},
    {direction: "top-left", className: "top-[-4px] left-[-4px] h-3 w-3 cursor-nwse-resize"},
    {direction: "top-right", className: "top-[-4px] right-[-4px] h-3 w-3 cursor-nesw-resize"},
    {direction: "bottom-right", className: "bottom-[-4px] right-[-4px] h-3 w-3 cursor-nwse-resize"},
    {direction: "bottom-left", className: "bottom-[-4px] left-[-4px] h-3 w-3 cursor-nesw-resize"},
]

export const bringTopicToFront = (topics: OpenTopic[], topicId: string) => {
    const otherTopics = topics.filter(t => t.topicId != topicId)
    const maxOtherZIndex = otherTopics.length > 0
        ? Math.max(...otherTopics.map(t => t.zIndex))
        : floatingTopicZIndexBase - 1

    let nextTopics = topics.map(t => t.topicId == topicId
        ? {...t, zIndex: maxOtherZIndex + 1}
        : t
    )

    const maxZIndex = Math.max(...nextTopics.map(t => t.zIndex))
    if(maxZIndex > floatingTopicZIndexBase + maxOpenFloatingTopics) {
        const minZIndex = Math.min(...nextTopics.map(t => t.zIndex))
        const offset = minZIndex - floatingTopicZIndexBase
        if(offset > 0) {
            nextTopics = nextTopics.map(t => ({
                ...t,
                zIndex: t.zIndex - offset
            }))
        } else {
            const topicsByZIndex = [...nextTopics].sort((a, b) => a.zIndex - b.zIndex)
            const compactZIndexes = new Map(
                topicsByZIndex.map((t, index) => [t.topicId, floatingTopicZIndexBase + index])
            )
            nextTopics = nextTopics.map(t => ({
                ...t,
                zIndex: compactZIndexes.get(t.topicId) ?? t.zIndex
            }))
        }
    }

    return nextTopics
}

export const getFloatingTopicInitialPosition = (clientX: number, clientY: number) => {
    const maxX = Math.max(
        floatingTopicViewportPadding,
        window.innerWidth - defaultFloatingTopicWidth - floatingTopicViewportPadding
    )
    const maxY = Math.max(
        floatingTopicViewportPadding,
        window.innerHeight - defaultFloatingTopicHeight - floatingTopicViewportPadding
    )

    return {
        x: Math.min(Math.max(clientX + floatingTopicOpenOffset, floatingTopicViewportPadding), maxX),
        y: Math.min(Math.max(clientY + floatingTopicOpenOffset, floatingTopicViewportPadding), maxY)
    }
}

export const FloatingTopic = ({openTopic, updateOpenTopic, onActivate, onClose}: {
    openTopic: OpenTopic;
    updateOpenTopic: (topicId: string, changes: Partial<OpenTopic>) => void
    onActivate: (topicId: string) => void
    onClose: () => void;
}) => {
    const {query, topic} = useTopicWithNormalizedContent(openTopic.topicId)
    const dragRef = useRef<{
        pointerId: number
        startX: number
        startY: number
        initialX: number
        initialY: number
    } | null>(null)
    const resizeRef = useRef<{
        pointerId: number
        direction: ResizeDirection
        startX: number
        startY: number
        initialX: number
        initialY: number
        initialWidth: number
        initialHeight: number
    } | null>(null)

    const startDrag = (e: PointerEvent<HTMLDivElement>) => {
        if(e.button !== 0) return

        onActivate(openTopic.topicId)
        e.currentTarget.setPointerCapture(e.pointerId)
        dragRef.current = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            initialX: openTopic.x,
            initialY: openTopic.y
        }
    }

    const drag = (e: PointerEvent<HTMLDivElement>) => {
        const data = dragRef.current
        if(!data || data.pointerId !== e.pointerId) return

        updateOpenTopic(openTopic.topicId, {
            x: data.initialX + e.clientX - data.startX,
            y: data.initialY + e.clientY - data.startY
        })
    }

    const stopDrag = (e: PointerEvent<HTMLDivElement>) => {
        if(dragRef.current?.pointerId === e.pointerId) {
            dragRef.current = null
            e.currentTarget.releasePointerCapture(e.pointerId)
        }
    }

    const startResize = (direction: ResizeDirection) => (e: PointerEvent<HTMLDivElement>) => {
        if(e.button !== 0) return
        e.stopPropagation()

        onActivate(openTopic.topicId)
        e.currentTarget.setPointerCapture(e.pointerId)
        resizeRef.current = {
            pointerId: e.pointerId,
            direction,
            startX: e.clientX,
            startY: e.clientY,
            initialX: openTopic.x,
            initialY: openTopic.y,
            initialWidth: openTopic.width,
            initialHeight: openTopic.height
        }
    }

    const resize = (e: PointerEvent<HTMLDivElement>) => {
        const data = resizeRef.current
        if(!data || data.pointerId !== e.pointerId) return

        const deltaX = e.clientX - data.startX
        const deltaY = e.clientY - data.startY
        const resizingLeft = data.direction.includes("left")
        const resizingRight = data.direction.includes("right")
        const resizingTop = data.direction.includes("top")
        const resizingBottom = data.direction.includes("bottom")

        let width = data.initialWidth
        let height = data.initialHeight
        let x = data.initialX
        let y = data.initialY

        if(resizingLeft) {
            width = Math.max(minFloatingTopicWidth, data.initialWidth - deltaX)
            x = data.initialX + data.initialWidth - width
        } else if(resizingRight) {
            width = Math.max(minFloatingTopicWidth, data.initialWidth + deltaX)
        }

        if(resizingTop) {
            height = Math.max(minFloatingTopicHeight, data.initialHeight - deltaY)
            y = data.initialY + data.initialHeight - height
        } else if(resizingBottom) {
            height = Math.max(minFloatingTopicHeight, data.initialHeight + deltaY)
        }

        updateOpenTopic(openTopic.topicId, {
            x,
            y,
            width,
            height
        })
    }

    const stopResize = (e: PointerEvent<HTMLDivElement>) => {
        if(resizeRef.current?.pointerId === e.pointerId) {
            resizeRef.current = null
            e.currentTarget.releasePointerCapture(e.pointerId)
        }
    }

    const content: ContentContextRef = {type: "topic", id: openTopic.topicId}

    return <div
        className={"fixed border bg-[var(--background)]"}
        style={{
            top: openTopic.y,
            left: openTopic.x,
            width: openTopic.width,
            height: openTopic.height,
            zIndex: openTopic.zIndex
        }}
    >
        {(query.isLoading || topic === "loading") && <div className={"h-full w-full flex justify-center items-center"}><LoadingSpinner/></div>}
        {(!query.isLoading && topic && topic !== "loading") && <div>
            <div
                className={cn("flex h-10 pr-1 items-center justify-between border-b cursor-grab select-none", dragRef.current != null && "cursor-grabbing")}
                onPointerDown={startDrag}
                onPointerMove={drag}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
            >
                <div className={"px-2 font-medium text-sm whitespace-nowrap max-w-[calc(100%-64px)] truncate text-ellipsis"}>
                    {getTopicTitle(topic)}
                </div>
                <div onPointerDown={e => e.stopPropagation()} className={"flex items-center cursor-default"}>
                    <BaseIconButton asChild title={"Maximizar"}>
                        <Link
                            href={getTopicPageHref(openTopic.topicId)}
                            onClick={e => e.stopPropagation()}
                        >
                            <CornersOutIcon/>
                        </Link>
                    </BaseIconButton>
                    <CloseButton onClose={onClose}/>
                </div>
            </div>
            <ContentContextProvider content={content}>
                <div className={"overflow-y-auto px-3 custom-scrollbar pb-8"} style={{maxHeight: openTopic.height - 40}}>
                    <TopicContent topic={topic} pinnedReplies={[]} setPinnedReplies={() => {}}/>
                </div>
            </ContentContextProvider>
        </div>}
        {resizeHandles.map(handle => <div
            key={handle.direction}
            className={cn("absolute", handle.className)}
            onPointerDown={startResize(handle.direction)}
            onPointerMove={resize}
            onPointerUp={stopResize}
            onPointerCancel={stopResize}
        />)}
    </div>
}
