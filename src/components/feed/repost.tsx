import {RepostProps} from "../../app/lib/definitions";
import {FeedElement} from "./feed-element";


export const Repost = ({repost}: {repost: RepostProps}) => {
    if(!repost.reaction){
        return <></> // el post reposteado fue eliminado
    }
    return <FeedElement
        elem={repost.reaction.reactsTo}
        repostedBy={repost.author}
    />
}