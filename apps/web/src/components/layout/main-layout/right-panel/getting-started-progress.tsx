"use client"

import React, {useRef, useState} from "react";
import {useSession} from "@/components/auth/use-session";
import {useProfile} from "@/components/perfil/use-profile";
import {ProfileMission, getProfileMissions} from "@/components/perfil/profile-objectives";
import {MinusIcon} from "@phosphor-icons/react";

const ProgressRow = ({label, progress, objective, detail}: Pick<ProfileMission, "label" | "progress" | "objective" | "detail">) => {
    const clamped = objective > 0 ? Math.min(Math.max(progress, 0) / objective * 100, 100) : 0
    return (
        <div className={"space-y-1"}>
            <div className={"flex items-center justify-between text-[13px]"}>
                <span>{label}</span>
                <span className={"text-[var(--text-light)]"}>{detail || `${clamped}%`}</span>
            </div>
            <div className={"h-2 rounded-full bg-[var(--background-dark3)] overflow-hidden"}>
                <div
                    className={"h-full bg-[var(--primary)]"}
                    style={{width: `${clamped}%`}}
                />
            </div>
        </div>
    )
}

export const CircularMissionProgress = ({
    completed,
    total,
    onClick,
}: {
    completed: number
    total: number
    onClick: () => void
}) => {
    const radius = 18
    const circumference = 2 * Math.PI * radius
    const ratio = total > 0 ? completed / total : 0
    const offset = circumference * (1 - ratio)

    return <button
        type="button"
        onClick={onClick}
        className={"panel flex h-16 w-16 items-center justify-center rounded-full p-0 hover:bg-[var(--background-dark2)]"}
        aria-label={`Abrir guía de inicio (${completed}/${total})`}
        title={`Guía de inicio ${completed}/${total}`}
    >
        <div className={"relative flex h-14 w-14 items-center justify-center"}>
            <svg
                className={"h-14 w-14 -rotate-90"}
                viewBox="0 0 44 44"
                aria-hidden="true"
            >
                <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    fill="none"
                    stroke="var(--background-dark3)"
                    strokeWidth="4"
                />
                <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <span className={"absolute text-[11px] font-semibold"}>
                {completed}/{total}
            </span>
        </div>
    </button>
}

function sortGoals(goals: ProfileMission[]) {
    return [...goals].sort((a, b) => {
        if (a.id === "complete-profile") return -1
        if (b.id === "complete-profile") return 1

        const aRatio = a.objective > 0 ? Math.min(a.progress / a.objective, 1) : 0
        const bRatio = b.objective > 0 ? Math.min(b.progress / b.objective, 1) : 0
        const aComplete = a.completed
        const bComplete = b.completed

        if (aComplete !== bComplete) {
            return aComplete ? 1 : -1
        }

        if (bRatio !== aRatio) {
            return bRatio - aRatio
        }

        return a.label.localeCompare(b.label)
    })
}

export function useGettingStartedProgressData() {
    const {user} = useSession()
    const {data: profile, isLoading} = useProfile(user?.handle ?? "", Boolean(user?.handle))
    const goals = sortGoals(profile ? getProfileMissions(profile) : [])
    const completedMissions = goals.filter(goal => goal.completed).length

    return {user, profile, isLoading, goals, completedMissions}
}

const GettingStartedProgress = () => {
    const [collapsed, setCollapsed] = useState(false)
    const scrollRef = useRef<HTMLDivElement | null>(null)
    const {user, profile, isLoading, goals, completedMissions} = useGettingStartedProgressData()

    const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
        const container = scrollRef.current

        if (!container) return

        const {deltaY} = event
        const canScroll = container.scrollHeight > container.clientHeight

        if (!canScroll || deltaY === 0) return

        const nextScrollTop = container.scrollTop + deltaY
        const maxScrollTop = container.scrollHeight - container.clientHeight
        const clampedScrollTop = Math.max(0, Math.min(nextScrollTop, maxScrollTop))

        event.preventDefault()
        event.stopPropagation()
        container.scrollTop = clampedScrollTop
    }

    if (!user || (!profile && !isLoading)) {
        return null
    }

    if (collapsed) {
        return <div className={"flex w-full justify-start"}>
            <CircularMissionProgress
                completed={completedMissions}
                total={goals.length}
                onClick={() => setCollapsed(false)}
            />
        </div>
    }

    return (
        <div className={"panel p-4 space-y-3"}>
            <div className={"flex items-center justify-between"}>
                <div className={"text-sm font-semibold"}>
                    Guía de inicio
                </div>
                <button
                    type="button"
                    className={"flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-light)] hover:bg-[var(--background-dark2)] hover:text-[var(--text)]"}
                    onClick={() => setCollapsed(true)}
                    aria-label="Minimizar guía de inicio"
                    title="Minimizar guía de inicio"
                >
                    <MinusIcon size={14}/>
                </button>
            </div>
            {!isLoading && <div
                ref={scrollRef}
                className={"max-h-72 space-y-3 overflow-y-auto overscroll-contain pr-1 custom-scrollbar"}
                onWheel={handleWheel}
            >
                {goals.map(goal => (
                    <ProgressRow
                        key={goal.id}
                        label={goal.label}
                        progress={goal.progress}
                        objective={goal.objective}
                        detail={goal.detail}
                    />
                ))}
            </div>}
        </div>
    )
}

export default GettingStartedProgress;
