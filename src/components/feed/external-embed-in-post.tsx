import {FastPostProps} from "@/lib/definitions";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";
import PublicIcon from '@mui/icons-material/Public';

const Domain = ({url}: {url: string}) => {
    try {
        const parsedUrl = new URL(url);
        return <div className={"flex items-center space-x-1 text-sm"}>
            <PublicIcon fontSize={"inherit"}/>
            <div>{parsedUrl.hostname}</div>
        </div>
    } catch (error) {
        console.error("Invalid URL:", error);
        console.error("url", url);
        return null;
    }
}


function imageSrcFromBlob(cid: string, did: string){
    return "https://cdn.bsky.app/img/feed_thumbnail/plain/"+did+"/"+cid+"@jpeg"
}


export const ImageFromThumb = ({thumb, authorDid}: {thumb: any, authorDid: string}) => {

    if(thumb.$type == "blob"){
        return <Image
            src={imageSrcFromBlob(thumb.ref.$link, authorDid)}
            alt=""
            className="w-full max-h-[296px] object-cover rounded-t-lg"
            width={400}
            height={300}
        />
    } else if(thumb.$type == "??"){
        return <div>
            {JSON.stringify(thumb)}
        </div>
    }

}


export const ExternalEmbedInPost = ({post}: {post: FastPostProps}) => {
    if(!post.content.post.embed) return null

    const embed = JSON.parse(post.content.post.embed)

    if(embed.$type != "app.bsky.embed.external") return null

    if(embed.external.uri.includes("cabildoabierto.com.ar")) return null

    return <div
        onClick={(e) => {e.preventDefault(); e.stopPropagation(); window.open(embed.external.uri, '_blank')}}
        className={"border rounded-lg cursor-pointer mt-1 hover:bg-[var(--background-dark2)]"}>
        {embed.external.thumb && <div>
            <ImageFromThumb thumb={embed.external.thumb} authorDid={post.author.did}/>
        </div>}
        <div className={embed.external.thumb ? "border-t p-2" : "p-2"}>
            <div className={"text-[15px] font-semibold mb-1"}>{embed.external.title}</div>
            <div className={"text-[14px]"}>{embed.external.description}</div>
            <hr className={"py-1"}/>
            <div className={"text-sm text-[var(--text-light)]"}>
                <Domain url={embed.external.uri}/>
            </div>
        </div>
    </div>
}