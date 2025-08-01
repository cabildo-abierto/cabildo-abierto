
import Link from 'next/link';
import {useTopicTitle} from "@/queries/useTopic";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";

function getSearchParam(url: string, param: string): string | null {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get(param);
    } catch (error) {
        console.error("Invalid URL:", error);
        return null;
    }
}


function clipStr(x: string, max: number) {
    return x.slice(0, max) + (x.length > max ? "..." : "")
}


const TopicMentionCompWithId = ({id, url}: {id: string, url: string}) => {
    const {data, isLoading} = useTopicTitle(id)
    const [editor] = useLexicalComposerContext()

    let target: "_blank" | undefined = editor.isEditable() ? "_blank" : undefined

    return <span className={"exclude-links"}>
        <Link href={url} target={target} className={"bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)] rounded-lg px-1"}>
            <span className={"text-[var(--text-light)]"}>
                {data ? clipStr(data.title, 50) : isLoading ? "..." : "Tema no encontrado"}
            </span>
        </Link>
    </span>
}


export const TopicMentionComp = ({url}: {url: string}) => {
    const i = getSearchParam(url, "i")
    if(!i) return <Link href={url}>{clipStr(url, 50)}</Link>

    return <TopicMentionCompWithId id={i} url={url}/>
}