"use client"

import {useCategories, useTopics} from "@/queries/getters/useTopics";
import {getTopicTitle} from "@/components/tema/utils";
import {CustomLink} from "@/components/utils/base/custom-link";
import {topicUrl} from "@/components/utils/react/url";
import TopicPopularityIndicator from "@/components/tema/topic-popularity-indicator";
import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import {InactiveCommentIcon} from "@/components/utils/icons/inactive-comment-icon";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";
import {TimePeriod} from "@/queries/getters/useTrendingTopics";
import {useState} from "react";
import {cn} from "@/lib/utils";
import {ListDashesIcon} from "@phosphor-icons/react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/utils/ui/popover";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";


const TopicCard = ({topic: t, i, timePeriod}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicViewBasic, i: number, timePeriod: TimePeriod
}) => {
    return <CustomLink
        tag={"div"}
        href={topicUrl(t.id)}
        className={
            "min-h-32 flex flex-col justify-between w-64 p-4 space-y-4 cursor-pointer rounded-[8px] " +
            "bg-[var(--background-dark)] hover:bg-[var(--background-dark2)] " +
            "transition-all duration-150 ease-out " +
            "hover:-translate-y-1 " +
            "opacity-0 animate-[cardIn_0.1s_ease-out_forwards]"
        }
        style={{
            animationDelay: `${i * 60}ms`
        }}
    >
        <div className={"tracking-tight font-extrabold"}>
            {getTopicTitle(t)}
        </div>
        <div className={"flex space-x-4"}>
            <div className={"flex"}>
                <TopicPopularityIndicator counts={t.popularity} selected={timePeriod}/>
            </div>
            <div className={"flex space-x-1 text-sm items-center text-[var(--text-light)]"}>
                <div>
                    {t.replyCount}
                </div>
                <div className={"pb-[2px]"}>
                    <InactiveCommentIcon fontSize={14}/>
                </div>
            </div>
            <div className={"flex space-x-1 items-center text-sm text-[var(--text-light)]"}>
                <div>
                    {t.editsCount}
                </div>
                <div className={"pb-[2px]"}>
                    <WriteButtonIcon fontSize={14}/>
                </div>
            </div>

        </div>
        {/*<div className={"flex items-center justify-end space-x-1 text-sm text-[var(--text-light)]"}>
                            <div className={"pb-[2px] opacity-80"}>
                                <WriteButtonIcon/>
                            </div>
                            <DateSince date={d.lastEdit}/>
                        </div>*/}
    </CustomLink>
}


function timePeriodInitial(t: TimePeriod) {
    return t == "day" ? "Día" : t == "week" ? "Semana" : "Mes"
}


const TopicCardList = ({sortedBy, timePeriod, title, categories, maxCount}: {
    sortedBy: "popular" | "recent"
    timePeriod: TimePeriod
    title: string
    categories: string[]
    maxCount: number
}) => {
    const {data} = useTopics(categories, sortedBy, timePeriod)
    if(!data) return null
    return <div className={"space-y-4"}>
        <div className={"font-bold text-lg"}>
            {title}
        </div>
        <div className={"flex flex-wrap items-start gap-8"}>
            {data.slice(0, maxCount).map((t, i) => {
                return (
                    <TopicCard
                        key={t.id}
                        topic={t}
                        i={i}
                        timePeriod={timePeriod}
                    />
                )
            })}

            <style jsx>{`
                @keyframes cardIn {
                    from {
                        opacity: 0;
                        transform: translateY(16px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    </div>
}


const CategorySelectorButton = ({selectedCategories, setSelectedCategories}: {
    selectedCategories: string[]
    setSelectedCategories: (categories: string[]) => void
}) => {
    const {data: categories, isLoading} = useCategories()
    return <>
        <Popover>
            <PopoverTrigger>
                <div
                    className={"uppercase cursor-pointer text-[var(--text-light)] hover:text-[var(--text)] flex space-x-2 items-center px-3 py-1 font-light hover:bg-[var(--background-dark)]"}>
                    <ListDashesIcon/>
                    <div className={"pt-[2px]"}>
                        Categorías
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent align={"start"} className={"max-w-64 bg-[var(--background-dark)] text-base max-h-[400px] custom-scrollbar overflow-y-scroll"}>
                <div className={"space-y-2 flex flex-col"}>
                    {selectedCategories.map(c => {
                        return <button
                            onClick={() => {
                                setSelectedCategories(selectedCategories.filter(c2 => c2 != c))
                            }}
                            key={c}
                            className={"bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)] px-2 py-1"}
                        >
                            {c}
                        </button>
                    })}
                    {isLoading && <div>
                        <LoadingSpinner/>
                    </div>}
                    {categories && categories.filter(c => !selectedCategories.includes(c)).map(c => <button
                        key={c}
                        onClick={() => {
                            setSelectedCategories([...selectedCategories, c])
                        }}
                        className={"px-2 py-1 hover:bg-[var(--background-dark2)]"}
                    >
                        {c}
                    </button>)}
                </div>
            </PopoverContent>
        </Popover>

    </>
}


const Temas = () => {
    const maxCount = 6
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("week")
    const [selectedCategories, setSelectedCategories] = useState<string[]>(["Política", "Ciencia y tecnología", "Sociedad", "Economía"])

    return <div className={""}>
        <div className={"flex space-x-16 pl-16"}>
            <div className={"space-x-3 flex"}>
                {["day", "week", "month"].map((v: TimePeriod) => <button
                    key={v}
                    onClick={() => {
                        setTimePeriod(v)
                    }}
                    className={cn(
                        "text-base py-1 px-3 uppercase font-light tracking-wider text-[var(--text-light)] hover:text-[var(--text)] hover:bg-[var(--background-dark)]",
                        v === timePeriod ? "text-[var(--text)] bg-[var(--background-dark2)] hover:bg-[var(--background-dark2)]" : ""
                    )}
                >
                    {timePeriodInitial(v)}
                </button>)}
            </div>

            <div>
                <CategorySelectorButton
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                />
            </div>
        </div>
        <div className={"pl-16 pt-4 space-y-12 pb-32"}>
            {["Global", ...selectedCategories].map(c => {
                return <TopicCardList
                    key={c}
                    sortedBy={"popular"}
                    title={c}
                    categories={c == "Global" ? [] : [c]}
                    timePeriod={timePeriod}
                    maxCount={maxCount}
                />
            })}
        </div>
    </div>
}

export default Temas