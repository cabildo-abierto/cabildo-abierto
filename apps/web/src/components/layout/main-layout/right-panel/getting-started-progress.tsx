"use client"

import React, {useState} from "react";
import {useAPI} from "@/components/utils/react/queries";
import {Goal, UserGuideStatus} from "@cabildo-abierto/api";

const ProgressRow = ({label, progress, objective, detail}: Goal) => {
    const clamped = Math.min(Math.max(progress, 0)/objective * 100, 100)
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

function useUserGuideStatus() {
    return useAPI<UserGuideStatus>(`/user-guide-status`,
        ["user-guide-status"],
        30000,
        undefined,
        30000)
}

function sortGoals(goals: Goal[]) {
    return [...goals].sort((a, b) => {
        const aRatio = a.objective > 0 ? Math.min(a.progress / a.objective, 1) : 0
        const bRatio = b.objective > 0 ? Math.min(b.progress / b.objective, 1) : 0
        const aComplete = aRatio >= 1
        const bComplete = bRatio >= 1

        if (aComplete !== bComplete) {
            return aComplete ? 1 : -1
        }

        if (bRatio !== aRatio) {
            return bRatio - aRatio
        }

        return a.label.localeCompare(b.label)
    })
}

const GettingStartedProgress = () => {
    const [collapsed, setCollapsed] = useState(false)
    const [showAll, setShowAll] = useState(false)
    const {data, isLoading} = useUserGuideStatus()
    const goals = sortGoals(data ?? [])

    return (
        <div className={"panel p-4 space-y-3"}>
            <div className={"flex items-center justify-between"}>
                <div className={"text-sm font-semibold"}>
                    Guía de inicio
                </div>
                <button
                    type="button"
                    className={"text-[11px] text-[var(--text-light)] hover:text-[var(--text)]"}
                    onClick={() => setCollapsed(value => !value)}
                >
                    {collapsed ? "Mostrar" : "Minimizar"}
                </button>
            </div>
            {!collapsed && !isLoading && <div className={"space-y-3"}>
                {(showAll ? goals : goals.slice(0, 3)).map(goal => (
                    <ProgressRow
                        key={goal.label}
                        label={goal.label}
                        progress={goal.progress}
                        objective={goal.objective}
                        detail={goal.detail}
                    />
                ))}
                {goals.length > 3 && (
                    <div className={"pt-1"}>
                        <button
                            type="button"
                            className={"text-[11px] text-[var(--text-light)] hover:text-[var(--text)]"}
                            onClick={() => setShowAll(value => !value)}
                        >
                            {showAll ? "Ver menos" : "Ver todos"}
                        </button>
                    </div>
                )}
            </div>}
        </div>
    )
}

export default GettingStartedProgress;
