import {useSearchParams} from "next/navigation"
import React, {useMemo, useState} from "react"
import {ProfilePic} from "../../../profile/profile-pic";
import {getUri} from "@/utils/uri";
import {useTopicHistory} from "@/queries/getters/useTopic";
import LoadingSpinner from "../../../layout/utils/loading-spinner";
import {ErrorPage} from "../../../layout/utils/error-page";
import {IconButton} from "../../../layout/utils/icon-button";
import {TopicContributor} from "@/lib/types";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index";
import {HistoryElement} from "@/components/topics/topic/history/history-element";


function getTopicContributors(history: ArCabildoabiertoWikiTopicVersion.TopicHistory): TopicContributor[] {
    const authors = new Map<string, TopicContributor>()

    history.versions.forEach(v => {
        const profile = v.author
        let contribution = v.contribution

        if (contribution) {
            const cur = authors.get(profile.did)
            const all = parseFloat((contribution.all ?? 0).toString())
            const monetized = parseFloat((contribution.monetized ?? 0).toString())
            if (cur) {
                authors.set(profile.did, {
                    profile,
                    all: all + cur.all,
                    monetized: monetized + cur.monetized
                })
            } else {
                authors.set(profile.did, {
                    profile,
                    all: all,
                    monetized: monetized
                })
            }
        }
    })

    return Array.from(authors.values())
}


const TopicVersionAuthors = ({topicVersionAuthors}: { topicVersionAuthors: TopicContributor[] }) => {

    function cmp(a: TopicContributor, b: TopicContributor) {
        return b.all - a.all
    }

    return <div className={"px-2 py-1"}>
        <div className={"text-[var(--text-light)]"}>
            <div className="flex flex-wrap space-x-2 text-sm">
                {topicVersionAuthors.toSorted(cmp).map((c, index) => {
                    return <div key={index}
                                className={"flex space-x-1 items-center rounded-lg"}>
                        <ProfilePic user={c.profile} className={"rounded-full w-4 h-4"}/>
                        <span>({(c.all * 100).toFixed(1)}%)</span>
                    </div>
                })}
            </div>
        </div>
    </div>
}


export const EditHistory = ({topic, className, onClose}: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
    className?: string
    onClose?: () => void
}) => {
    const {data: topicHistory, isLoading} = useTopicHistory(topic.id)

    const contributors = useMemo(() => {
        return topicHistory ? getTopicContributors(topicHistory) : undefined
    }, [topicHistory])

    if (isLoading) {
        return <div className={"py-16"}>
            <LoadingSpinner/>
        </div>
    }

    if (!topicHistory) {
        return <div className={"py-4"}>
            <ErrorPage>
                Ocurrió un error al cargar el historial.
            </ErrorPage>
        </div>
    }

    return <>
        <div className={"flex justify-end py-1 px-1"}>
            <TopicVersionAuthors topicVersionAuthors={contributors}/>
        </div>
        <div className={"space-y-1 px-1 " + className}>
            {topicHistory.versions.map((_, index) => {
                const versionIndex = topicHistory.versions.length - 1 - index
                return <div key={topicHistory.versions[versionIndex].uri} className="w-full">
                    <HistoryElement
                        topic={topic}
                        topicHistory={topicHistory}
                        index={versionIndex}
                        onClose={onClose}
                    />
                </div>
            })}
        </div>
    </>
}
