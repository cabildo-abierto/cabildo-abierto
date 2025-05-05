import Image from "next/image";
import PublicIcon from '@mui/icons-material/Public';
import {View as ExternalEmbedView} from "@/lex-api/types/app/bsky/embed/external";
import {PrettyJSON} from "../../../../modules/ui-utils/src/pretty-json";

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

type PostExternalEmbedProps = {
    embed: ExternalEmbedView
}

export const PostExternalEmbed = ({embed}: PostExternalEmbedProps) => {
    if (embed.external.uri.includes("cabildoabierto.com.ar")) return null // TO DO: Dudoso, está por las visualizaciones

    return <div
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(embed.external.uri, '_blank')
        }}
        className={"border rounded-lg cursor-pointer mt-1 hover:bg-[var(--background-dark2)]"}>
        {embed.external.thumb && embed.external.thumb.length > 0 ?
            <div>
                <Image
                    src={embed.external.thumb}
                    alt={""}
                    className="w-full max-h-[240px] object-cover rounded-t-lg"
                    width={400}
                    height={300}
                />
            </div> :
            <div className="font-semibold px-2 text-[15px] pt-2 break-all">
                {embed.external.uri}
            </div>
        }
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