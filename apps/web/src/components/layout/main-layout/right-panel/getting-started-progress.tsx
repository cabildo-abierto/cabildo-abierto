"use client"

import React, {useMemo, useState} from "react";

type Goal = {
    label: string
    progress: number
    detail?: string
}

const goals: Goal[] = [
    {label: "Seguir personas", progress: 0},
    {label: "Leer un tema", progress: 0},
    {label: "Editar un tema", progress: 0},
    {label: "Crear un tema", progress: 0},
    {label: "Escribir un articulo", progress: 0},
    {label: "Comentar en un tema", progress: 0},
    {label: "Votar en una encuesta", progress: 0},
];

const ProgressRow = ({label, progress, detail}: Goal) => {
    const clamped = Math.min(Math.max(progress, 0), 100)
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

const GettingStartedProgress = () => {
    const [collapsed, setCollapsed] = useState(false)
    const [showAll, setShowAll] = useState(false)

    const orderedGoals = useMemo(() => {
        return goals
            .map((goal, index) => ({goal, index}))
            .sort((a, b) => {
                if (b.goal.progress !== a.goal.progress) {
                    return b.goal.progress - a.goal.progress
                }
                return a.index - b.index
            })
            .map(({goal}) => goal)
    }, [])

    const visibleGoals = showAll ? orderedGoals : orderedGoals.slice(0, 3)

    return (
        <div className={"panel p-4 space-y-3"}>
            <div className={"flex items-center justify-between"}>
                <div className={"text-sm font-semibold"}>
                    Guia de inicio
                </div>
                <button
                    type="button"
                    className={"text-[11px] text-[var(--text-light)] hover:text-[var(--text)]"}
                    onClick={() => setCollapsed(value => !value)}
                >
                    {collapsed ? "Mostrar" : "Minimizar"}
                </button>
            </div>
            {!collapsed && <div className={"space-y-3"}>
                {visibleGoals.map(goal => (
                    <ProgressRow
                        key={goal.label}
                        label={goal.label}
                        progress={goal.progress}
                        detail={goal.detail}
                    />
                ))}
                {orderedGoals.length > 3 && (
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
