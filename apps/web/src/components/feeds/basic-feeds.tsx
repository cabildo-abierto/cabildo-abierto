import {FeedView} from "@cabildo-abierto/api";
import {FeedPreview} from "@/components/feeds/feed-preview";

const basicFeeds: FeedView[] = [
    {
        type: "main",
        subtype: "siguiendo"
    },
    {
        type: "main",
        subtype: "discusion"
    },
    {
        type: "main",
        subtype: "descubrir",
    }
]


export const BasicFeeds = () => {

    return <div>
        {basicFeeds.map((f, i) => {
            return <FeedPreview feed={f} key={i}/>
        })}
    </div>
}