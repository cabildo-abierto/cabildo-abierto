"use client"
import {ArticlePreview} from "./article-preview";
import {FastPostPreview} from "./fast-post-preview";
import {
    ArticleProps,
    DatasetProps,
    FastPostProps,
    FeedContentProps, RepostProps, SmallUserProps, TopicVersionOnFeedProps,
    VisualizationProps
} from "../../app/lib/definitions";
import {DatasetPreview} from "../datasets/dataset-preview";
import {VisualizationOnFeed} from "./visualization-on-feed";
import {Repost} from "./repost";
import {TopicVersionOnFeed} from "../topic/topic-version-on-feed";


export const FeedElement = ({elem, onClickQuote, repostedBy,
    showChildren=false,
    showParent=false,
    showingChildren=false,
    showingParent=false,
    showReplyTo
}: {
    elem: FeedContentProps & {blocked?: boolean, notFound?: boolean}
    onClickQuote?: (cid: string) => void
    repostedBy?: {displayName?: string, handle: string}
    showingChildren?: boolean
    showingParent?: boolean
    showParent?: boolean
    showChildren?: boolean
    showReplyTo?: SmallUserProps
}) => {
    if(elem.blocked){
        return <div className={"py-4 px-2"}>
            Contenido bloqueado
        </div>
    } else if(elem.notFound){
        return <div className={"py-4 px-2"}>Contenido no encontrado</div>
    }
    elem = elem as FeedContentProps
    if(elem.author.inCA != undefined && !elem.author.inCA){
        return <div className={"border-b py-6 w-full text-center"}>
            Este post no está en la base de datos de Cabildo Abierto.
        </div>
    }
    if(elem.collection == "ar.com.cabildoabierto.article"){
        return <ArticlePreview
            elem={elem as ArticleProps}
        />
    } else if(elem.collection == "app.bsky.feed.post" || elem.collection == "ar.com.cabildoabierto.quotePost"){
        return <FastPostPreview
            showChildren={showChildren}
            post={elem as FastPostProps}
            onClickQuote={onClickQuote}
            repostedBy={repostedBy}
            showParent={showParent}
            showingParent={showingParent}
            showingChildren={showingChildren}
            showReplyTo={showReplyTo}
        />
    } else if(elem.collection == "ar.com.cabildoabierto.dataset"){
        return <DatasetPreview
            dataset={elem as DatasetProps}
        />
    } else if(elem.collection == "ar.com.cabildoabierto.visualization") {
        return <VisualizationOnFeed
            visualization={elem as VisualizationProps}
        />
    } else if(elem.collection == "app.bsky.feed.repost"){
        return <Repost repost={elem as RepostProps}/>
    } else if(elem.collection == "ar.com.cabildoabierto.topic"){
        return <TopicVersionOnFeed topicVersion={elem as TopicVersionOnFeedProps}/>
    }
}