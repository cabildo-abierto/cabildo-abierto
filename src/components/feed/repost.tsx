import {RepostProps} from "../../app/lib/definitions";
import {FeedElement} from "./feed-element";


export const Repost = ({repost}: {repost: RepostProps}) => {
    if(!repost.reaction || !repost.reaction.reactsTo){
        return <></> // el post reposteado fue eliminado o es de un usuario que no está en CA
    }
    console.log("repost reacts to", repost.reaction.reactsTo)
    return <><FeedElement
        elem={repost.reaction.reactsTo}
        repostedBy={repost.author}
    /></>
}