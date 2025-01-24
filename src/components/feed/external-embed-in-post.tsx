import {FastPostProps} from "../../app/lib/definitions";
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
        console.log("url", url);
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
                className={"w-full max-h-[268px] overflow-clip rounded-t-lg"}
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

    return <div onClick={(e) => {e.preventDefault(); e.stopPropagation(); window.open(embed.external.uri, '_blank')}} className={"border rounded-lg mt-1"}>
        {embed.external.thumb && <div>
            <ImageFromThumb thumb={embed.external.thumb} authorDid={post.author.did}/>
        </div>}
        <div className={embed.external.thumb ? "border-t p-2" : "p-2"}>
            <div className={"font-bold"}>{embed.external.title}</div>
            <div className={""}>{embed.external.description}</div>
            <hr className={"py-1"}/>
            <div className={"text-sm text-[var(--text-light)]"}>
                <Domain url={embed.external.uri}/>
            </div>
            {/*<Image src={embed.external.thumb.uri} width={400} height={300} alt={"A external embed."}/>*/}
        </div>
    </div>
}