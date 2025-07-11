import {TimePeriod, useTrendingTopics} from "@/queries/api";
import {range} from "@/utils/arrays";
import {emptyChar} from "@/utils/utils";

import dynamic from "next/dynamic";
import TopicsIcon from "@/components/icons/topics-icon";
import {Select} from "../../../../modules/ui-utils/src/select";
import {useState} from "react";

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


const TrendingTopicsConfig = ({time, setTime}: { time: string, setTime: (v: string) => void }) => {

    return <div className={"w-[140px]"}>
        <Select
            options={["día", "semana", "mes"]}
            onChange={setTime}
            value={time}
            fontSize={"14px"}
            labelShrinkFontSize={"14px"}
            paddingY={0.3}
            paddingX={1}
            textClassName={"text-sm text-[var(--text)]"}
            backgroundColor={"background-dark2"}
            borderColor={"background-dark"}
            outlineColor={"background-dark3"}
        />
    </div>
}

function timeLabelToTimePeriod(label: string): TimePeriod {
    if (label == "semana") return "week"
    if (label == "mes") return "month"
    if (label == "día") return "day"
    return "all"
}

export const TrendingTopicsPanel = () => {
    const [time, setTime] = useState("semana")
    const {data: topics, isLoading} = useTrendingTopics(timeLabelToTimePeriod(time))

    function selectedToTimePeriod(selected: string): TimePeriod {
        if (selected == "semana") return "week"
        if (selected == "mes") return "month"
        if (selected == "day") return "day"
        return "all"
    }

    return <div className="space-y-2 bg-[var(--background-dark)] rounded-lg w-[300px]">
        <div className="flex justify-between pt-3 px-3 items-center w-full">
            <div
                className={"text-xs font-bold flex items-center w-full space-x-1"}
                id={"trending-topics"}
            >
                <TopicsIcon fontSize={12}/>
                <span>Temas en tendencia</span>
            </div>
            <TrendingTopicsConfig time={time} setTime={setTime}/>
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

