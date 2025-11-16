import {TimePeriod, useTrendingTopics} from "@/queries/getters/useTrendingTopics";
import {range} from "@cabildo-abierto/utils/dist/arrays";
import {emptyChar} from "../../../../utils/utils";
import dynamic from "next/dynamic";
import {useState} from "react";
import Link from "next/link";
import {TrendingTopicsConfig} from "./trending-topics-config";
import { Session } from "@cabildo-abierto/api";
import {useSession} from "@/components/auth/use-session";

const TrendingTopicsSlider = dynamic(() => import('./trending-topics-slider'));


const LoadingTrendingTopicsSlider = ({count = 10}: { count?: number }) => {
    return <div className={"flex flex-col overflow-y-scroll max-h-[300px] no-scrollbar"}>
        {range(count).map(i => {
            return <div key={i}
                        className={"cursor-pointer space-y-1 flex flex-col py-4 w-full px-5 sm:text-sm text-xs text-[0.72rem] hover:bg-[var(--background-dark2)]"}>
                <div className={"flex space-x-2"}>
                    <div className={"rounded bg-[var(--background-dark2)] h-3 w-16"}>
                        {emptyChar}
                    </div>
                    <div className={"rounded bg-[var(--background-dark2)] h-3 w-16"}>
                        {emptyChar}
                    </div>
                </div>

                <div className={"rounded bg-[var(--background-dark2)] h-4 w-32"}>
                    {emptyChar}
                </div>

                <div className={"rounded bg-[var(--background-dark2)] h-4 w-24"}>
                    {emptyChar}
                </div>
            </div>
        })}
    </div>
}

function timeLabelToTimePeriod(label: string): TimePeriod {
    if (label == "semana") return "week"
    if (label == "mes") return "month"
    if (label == "día") return "day"
    return "all"
}

function selectedToTimePeriod(selected: string): TimePeriod {
    if (selected == "semana") return "week"
    if (selected == "mes") return "month"
    if (selected == "día") return "day"
    return "all"
}

function ttInitialConfig(user: Session | null): string {
    const label = user?.algorithmConfig?.tt?.time ?? "Última semana"
    if (label == "Última semana") {
        return "semana"
    } else if (label == "Último día") {
        return "día"
    } else if (label == "Último mes") {
        return "mes"
    } else {
        return "semana"
    }
}

export const TrendingTopicsPanel = () => {
    const {user} = useSession()
    const [time, setTime] = useState<string>(ttInitialConfig(user))
    const {data: topics, isLoading} = useTrendingTopics(timeLabelToTimePeriod(time))

    return <div className="w-full space-y-2 panel">
        <div className="flex justify-between h-10 px-3 items-center w-full">
            <Link
                href={"/temas"}
                className={"text-xs uppercase font-bold flex items-center space-x-1"}
                id={"trending-topics"}
            >
                Tendencias
            </Link>
            <TrendingTopicsConfig
                time={time}
                setTime={setTime}
            />
        </div>
        {topics ?
            <TrendingTopicsSlider
                selected={selectedToTimePeriod(time)}
                trendingArticles={topics}
            /> :
            (isLoading ?
                    <LoadingTrendingTopicsSlider/> :
                    <div className={"text-center text-[var(--text-light)] text-sm pt-2 pb-6"}>
                        Error al cargar
                    </div>
            )
        }
    </div>
}

