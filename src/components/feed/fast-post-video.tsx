import {FastPostProps} from "../../app/lib/definitions";
import Link from "next/link";


export const FastPostVideo = ({post}: {post: FastPostProps}) => {
    if(!post.content.post.embed){
        return null
    }
    const embed = JSON.parse(post.content.post.embed)

    const bskyUrl = "https://bsky.app/profile/" + post.author.handle + "/post/" + post.rkey

    if(embed.video){
        return <div
            onClick={(e) => {
                e.preventDefault(); e.stopPropagation(); window.open(bskyUrl, '_blank')}}
            className={"border rounded-lg mt-2 p-2 hover:bg-[var(--background-dark2)]"}
        >
            <Link target="_blank" href={bskyUrl}>Ver video en Bluesky</Link>
        </div>
    }
    return null
}