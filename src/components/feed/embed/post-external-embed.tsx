import Image from "next/image";
import PublicIcon from '@mui/icons-material/Public';
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {ViewRecord} from "@/lex-api/types/app/bsky/embed/record";
import {isView as isExternalEmbed} from "@/lex-api/types/app/bsky/embed/external";

const Domain = ({url}: { url: string }) => {
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


export const PostExternalEmbed = ({embed}: { embed: PostView["embed"] | ViewRecord["embeds"] }) => {
    if (!embed) return null

    if ("length" in embed) {
        // TO DO
        return <PostExternalEmbed embed={embed[0]}/>
    }

    if (!isExternalEmbed(embed)) return null

    if (embed.external.uri.includes("cabildoabierto.com.ar")) return null

    return <div
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(embed.external.uri, '_blank')
        }}
        className={"border rounded-lg cursor-pointer mt-1 hover:bg-[var(--background-dark2)]"}>
        {embed.external.thumb && embed.external.thumb.length > 0 && <div>
            <Image
                src={embed.external.thumb}
                alt={""}
                className="w-full max-h-[296px] object-cover rounded-t-lg"
                width={400}
                height={300}
            />
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