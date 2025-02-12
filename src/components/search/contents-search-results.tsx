import {useSearchableContents} from "../../hooks/contents";
import {useSearch} from "./search-context";
import LoadingSpinner from "../loading-spinner";
import {ArticleProps, FastPostProps, FeedContentProps} from "../../app/lib/definitions";
import {cleanText} from "../utils";
import Feed from "../feed/feed";


export const ContentsSearchResults = () => {
    const {searchState} = useSearch()
    const contents = useSearchableContents()

    if(contents.isLoading || !contents.feed){
        return <LoadingSpinner/>
    }

    const searchValue = cleanText(searchState.value)

    if(searchValue.length == 0){
        return null
    }

    let filteredContents = contents.feed.filter((c: FeedContentProps) => {
        if(c.collection == "app.bsky.feed.post"){
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