import React, { useState } from "react"
import { ContentWithCommentsFromId } from "./content-with-comments";
import { useUser } from "src/app/hooks/user";
import LoadingSpinner from "./loading-spinner";
import { NoResults } from "./category-users";


export type FeedProps = {
    feed: {id: string}[],
    isLoading: boolean,
    isError: boolean
}


const Feed: React.FC<{feed: FeedProps, noResultsText?: string, maxSize?: number}> = ({feed, maxSize, noResultsText="No se encontró ninguna publicación."}) => {
    const user = useUser()
    const [range, setRange] = useState(maxSize)
    if(feed.isLoading || user.isLoading){
        return <LoadingSpinner/>
    }
    if(feed.isError){
        return <></>
    }

    let content = null
    if(feed.feed.length == 0){
        content = <NoResults text={noResultsText}/>
    } else {
        content = <>
            {feed.feed.slice(0, range ? range : feed.feed.length).map(({id}, index: number) => {
                return <div key={index} className="w-full">
                    <ContentWithCommentsFromId
                        contentId={id}
                        inCommentSection={false}
                    />
                </div>
            })}
            {maxSize && <div className="flex justify-center">
                <button className="hover:text-[var(--primary)]" onClick={() => {setRange(range+maxSize)}}>Ver más</button>
            </div>}
        </>
    }

    return <div className="h-full w-full flex flex-col items-center space-y-2">
        {content}
    </div>
}

export default Feed