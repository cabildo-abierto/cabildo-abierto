import {RepostProps} from "../../app/lib/definitions";
import {FeedElement} from "./feed-element";


export const Repost = ({repost}: {repost: RepostProps}) => {
    return <FeedElement
        elem={repost.reaction.reactsTo}
        repostedBy={repost.author}
    />
}