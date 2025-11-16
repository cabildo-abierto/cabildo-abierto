import Image from "next/image";
import {AppBskyEmbedExternal} from "@atproto/api"
import DomainIcon from "@/components/utils/icons/domain-icon";
import {cn} from "@/lib/utils";

const Domain = ({url}: { url: string }) => {
    try {
        const parsedUrl = new URL(url);
        return <div className={"flex items-center space-x-1 text-sm"}>
            <DomainIcon/>
            <div>{parsedUrl.hostname}</div>
        </div>
    } catch (error) {
        console.error("Invalid URL:", error);
        console.error("url", url);
        return null;
    }
}

type PostExternalEmbedProps = {
    embed: AppBskyEmbedExternal.View
}

export const PostExternalEmbed = ({embed}: PostExternalEmbedProps) => {
    if (embed.external.uri.includes("cabildoabierto.com.ar")) return null // TO DO: Dudoso, está por las visualizaciones

    return <div
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(embed.external.uri, '_blank')
        }}
        className={"cursor-pointer mt-1 embed-panel"}
    >
        {embed.external.thumb && embed.external.thumb.length > 0 &&
        <div>
            <Image
                src={embed.external.thumb}
                alt={""}
                className="w-full max-h-[240px] object-cover"
                width={400}
                height={300}
            />
        </div>}
        <div className={cn(embed.external.thumb ? "border-t px-2 pt-2 pb-1" : "pb-1 px-2 pt-2")}>
            <div className="text-[15px] font-semibold break-all">
                {embed.external.title ? embed.external.title : embed.external.uri}
            </div>
            <div className="text-sm line-clamp-2 pb-1">
                {embed.external.description}
            </div>
            <hr/>
            <div className="text-sm text-[var(--text-light)] pt-[2px]">
                <Domain url={embed.external.uri}/>
            </div>
        </div>
    </div>
}