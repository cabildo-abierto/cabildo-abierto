import {useSearchableContents} from "../../hooks/contents";
import {useSearch} from "./search-context";
import LoadingSpinner from "../loading-spinner";
import {ArticleProps, FastPostProps, FeedContentProps} from "../../app/lib/definitions";
import {cleanText} from "../utils";
import Feed from "../feed/feed";
import {ErrorPage} from "../error-page";


export const ContentsSearchResults = () => {
    const {searchState} = useSearch()
    const {feed, isLoading} = useSearchableContents()

    const searchValue = cleanText(searchState.value)

    if(searchValue.length == 0){
        return <div className={"mt-8 text-[var(--text-light)] text-center"}>
            Buscá un post, respuesta o artículo
        </div>
    }

    if(isLoading){
        return <div className={"mt-8"}><LoadingSpinner/></div>
    }

    if(!feed){
        return <ErrorPage>Ocurrió un error al buscar los resultados.</ErrorPage>
    }

    let filteredContents = feed.filter((c: FeedContentProps) => {
        if(c.collection == "app.bsky.feed.post"){
            if(!(c as FastPostProps).content){
                return false
            }
            const text = cleanText((c as FastPostProps).content.text)
            return text.includes(searchValue)
        } else if(c.collection == "ar.com.cabildoabierto.article"){
            const text = cleanText((c as ArticleProps).content.article.title)
            return text.includes(searchValue)
        } else {
            return false
        }
    })

    return <Feed feed={{feed: filteredContents, isLoading: false, error: undefined}}/>
}