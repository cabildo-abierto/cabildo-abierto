
import { CustomLink as Link } from './custom-link';
import { Button } from "@mui/material"
import { useState } from "react"
import { BothContributionsProps, ContributionsProps } from "../app/lib/definitions"
import {getTopicMonetizedChars} from "./utils";
import {useTopic} from "../hooks/topics";



function round2(x: number){
    return Math.round(x * 100) / 100
}


export function toPercentage(chars: number, total: number){
    if(total == 0) return <></>
    return round2(chars / total * 100)
}


export const ShowContributors = ({topicId}:
    {topicId: string, userId?: string}) => {
    const {topic, isLoading} = useTopic(topicId)
    const [monetized, setMonetized] = useState(false)

    if(isLoading) return <></>

    const lastVersion = topic.versions[topic.versions.length-1]
    const firstVersion = topic.versions[0]

    if(lastVersion.accCharsAdded == 0){
        return <div className="flex">
            <div className="flex space-x-2 link">
                <Link href={"/perfil/"+firstVersion.author.did}>@{firstVersion.author.did}</Link>
            </div>.
        </div>
    }

    let contributions: ContributionsProps
    try {
        let contributionsBoth: BothContributionsProps = JSON.parse(lastVersion.contribution)
        contributions = monetized ? contributionsBoth.monetized : contributionsBoth.all
    } catch {
        return <></>
    }

    if(contributions == null){
        return <></>
    }

    function comp(a: any, b: any){
        return b[1] - a[1]
    }

    let total = lastVersion.accCharsAdded
    if(monetized){
        total = getTopicMonetizedChars(topic, topic.versions.length-1)
    }

    contributions = contributions.sort(comp)

    return <div className="mt-2">
        {contributions.length == 0 && <div className="text-[var(--text-light)] text-sm">Ningún autor</div>}
        {contributions.length > 0 && <div className="flex">
            <div className="flex flex-wrap space-x-2 link">
                {contributions.map(([authorId, chars], index) => {
                    return <span key={index}><Link href={"/perfil/"+authorId}>@{authorId}</Link> ({toPercentage(chars, total)}%)</span>
                })}.
            </div>
        </div>}
        <div className="flex justify-end text-[var(--text-light)]">
        <Button
            onClick={() => {setMonetized(!monetized)}}
            size="small"
            color="inherit"
            sx={{textTransform: "none"}}
        >
            {monetized ? "todo" : "monetizado"}
        </Button>
        </div>
    </div>
}