import React, {ReactNode, useEffect, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useSession} from "@/components/auth/use-session";
import {useLayoutState} from "@/components/layout/main-layout/layout-state-context";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {CloseButtonIcon} from "@/components/utils/icons/close-button-icon";
import {useAPI} from "@/components/utils/react/queries";
import {Session, UserGuideGoal, UserGuideStatus} from "@cabildo-abierto/api";
import {count, profileUrl, sum} from "@cabildo-abierto/utils";
import VisualizationIcon from "@/components/utils/icons/visualization-icon";
import {AcceptButtonPanel} from "@/components/utils/dialogs/accept-button-panel";
import {cn} from "@/lib/utils";
import {Paragraph} from "@/components/utils/base/paragraph";


type ProgressCircleProps = {
    ratio: number
    size: number
    strokeWidth: number
    fillColor: string
    trackColor: string
    progressColor: string
    showCheck?: boolean
}

const ProgressCircle = ({
    ratio,
    size,
    strokeWidth,
    fillColor,
    trackColor,
    progressColor,
    showCheck = false,
}: ProgressCircleProps) => {
    const clampedRatio = Math.min(Math.max(ratio, 0), 1)
    const center = size / 2
    const radius = center - strokeWidth / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - clampedRatio)

    return (
        <div className={"relative shrink-0"} style={{width: size, height: size}}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                aria-hidden
            >
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill={fillColor}
                    stroke={showCheck ? progressColor : trackColor}
                    strokeWidth={strokeWidth}
                />
                {clampedRatio > 0 && (
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill={"none"}
                        stroke={progressColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap={"round"}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        transform={`rotate(-90 ${center} ${center})`}
                    />
                )}
            </svg>
        </div>
    )
}


function getGoalHelp(user: Session, goal: UserGuideGoal): {url?: string | null, text?: ReactNode | null} {
    return {
        "Completá tu perfil": {
            url: profileUrl(user.handle),
            text: null
        },
        "Seguí a 10 personas": {
            url: "/perfil/cuentas-sugeridas"
        },
        "Editá un tema": {
            url: "/temas",
            text: null
        },
        "Entrá a un tema": {
            url: "/temas",
            text: null
        },
        "Comentá en un tema": {
            url: "/temas",
            text: null
        },
        "Escribí un artículo": {
            url: "/escribir/articulo",
            text: null
        },
        "Creá o editá una visualización": {
            url: null,
            text: <div>
                Podés hacer click en el ícono <VisualizationIcon className={"inline-block"}/> para abrir el editor de visualizaciones desde los editores de publicaciones, artículos o temas.
            </div>
        },
        "Votá en una encuesta": {
            url: null,
            text: <div>
                Tip: Podés encontrar encuestas dentro de algunos artículos o temas.
            </div>
        }
    }[goal.label] ?? null
}


const ProgressRow = (goal: UserGuideGoal) => {
    const ratio = goal.objective > 0 ? Math.min(Math.max(goal.progress, 0) / goal.objective, 1) : 0
    const isComplete = ratio >= 1
    const clampedProgress = goal.objective > 0 ? Math.min(Math.max(goal.progress, 0), goal.objective) : 0
    const {user} = useSession()
    const router = useRouter()
    const help = getGoalHelp(user, goal)
    const [showHelpModal, setShowHelpModal] = useState(false)

    return (
        <>
        <div
            onClick={() => {
                if(help) {
                    if(help.url) {
                        router.push(help.url)
                    } else {
                        setShowHelpModal(true)
                    }
                }
            }}
            className={"space-y-1 hover:bg-[var(--background-dark)] cursor-pointer p-1.5"}>
            <div className={"flex items-center justify-between text-[13px]"}>
                <span>{goal.label}</span>
                <ProgressCircle
                    ratio={ratio}
                    size={18}
                    strokeWidth={2.5}
                    fillColor={"var(--background)"}
                    trackColor={"var(--background-dark3)"}
                    progressColor={"var(--primary)"}
                    showCheck={isComplete}
                />
            </div>
            <div className={"text-[12px] text-[var(--text-light)]"}>
                {goal.detail || `${clampedProgress}/${goal.objective} completado.`}
            </div>
        </div>
            {showHelpModal && <AcceptButtonPanel
                open={showHelpModal}
                onClose={() => {setShowHelpModal(false)}}
            >
                <Paragraph>
                    {help.text}
                </Paragraph>
            </AcceptButtonPanel>}
        </>
    )
}

export const GettingStartedProgressSmall = () => {
    const {userGuideStatus, isLoading} = useUserGuideStatus()
    const {setLayoutState} = useLayoutState()

    function onClick() {
        setLayoutState((prev) => ({
            ...prev,
            gettingStartedGuideOpen: true,
            gettingStartedGuideHighlightToken: prev.gettingStartedGuideHighlightToken + 1,
        }))
    }

    if(isLoading || !userGuideStatus) return null

    const completed = sum(userGuideStatus, g => Number(g.progress >= g.objective))
    const total = userGuideStatus.length
    const ratio = total > 0 ? Math.min(Math.max(completed / total, 0), 1) : 0

    if(completed >= total) return null

    return <button
        onClick={onClick}
        className={"hover:opacity-80 flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full p-0 hover:bg-[var(--background-dark2)]"}
        aria-label={`Abrir guía de inicio (${completed}/${total})`}
        title={`Guía de inicio ${completed}/${total}`}
    >
        <ProgressCircle
            ratio={ratio}
            size={12}
            strokeWidth={2}
            fillColor={"var(--background-dark2)"}
            trackColor={"var(--background-dark3)"}
            progressColor={"var(--primary)"}
        />
    </button>
}

export function useUserGuideStatus() {
    const {user} = useSession()
    const {data: userGuideStatus, isLoading} = useAPI<UserGuideStatus>("/user-guide-status", ["user-guide-status"])
    const pathname = usePathname()

    const guidePage = Boolean(
        user && (
            pathname.includes("/inicio")
            || pathname.startsWith("/perfil") &&
            (pathname.includes(user.did) || pathname.includes(user.handle))
        )
    )
    return {userGuideStatus, isLoading, guidePage}
}

const GettingStartedProgress = () => {
    const scrollRef = useRef<HTMLDivElement | null>(null)
    const {setLayoutState, layoutState} = useLayoutState()
    const {userGuideStatus, isLoading} = useUserGuideStatus()
    const [isHighlighted, setIsHighlighted] = useState(false)

    useEffect(() => {
        if (layoutState.gettingStartedGuideHighlightToken === 0) return

        setIsHighlighted(true)
        console.log("set is highlighted to ture")
        const timeout = window.setTimeout(() => {
            setIsHighlighted(false)
        }, 550)

        return () => window.clearTimeout(timeout)
    }, [layoutState.gettingStartedGuideHighlightToken])

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

    if(!userGuideStatus) return null

    const completed = count(userGuideStatus, g => g.progress >= g.objective)
    const total = userGuideStatus.length

    return (
        <div className={cn(
            "border border-[var(--accent-dark)] space-y-3 transition-all duration-500",
            isHighlighted ? "bg-[var(--background-dark)]" : "")}
        >
            <div className={"flex items-center justify-between pt-3 px-4"}>
                <div className={"text-xs font-bold uppercase"}>
                    Guía de inicio ({completed}/{total})
                </div>
                <BaseIconButton
                    size={"small"}
                    className={"flex items-center justify-center text-[var(--text-light)] hover:bg-[var(--background-dark2)] hover:text-[var(--text)]"}
                    onClick={() => {
                        setLayoutState((prev) => ({...prev, gettingStartedGuideOpen: false}))
                    }}
                    aria-label="Minimizar guía de inicio"
                    title="Minimizar guía de inicio"
                >
                    <CloseButtonIcon/>
                </BaseIconButton>
            </div>
            {!isLoading && <div
                ref={scrollRef}
                className={"max-h-48 px-2 pb-4 space-y-1 overflow-y-auto overscroll-contain custom-scrollbar"}
                onWheel={handleWheel}
            >
                {userGuideStatus.map(goal => (
                    <ProgressRow
                        key={goal.label}
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
