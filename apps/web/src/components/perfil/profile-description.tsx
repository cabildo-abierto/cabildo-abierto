import BskyRichTextContent from "@/components/feed/post/bsky-rich-text-content";
import {useMemo} from "react";
import {RichText} from "@atproto/api";


export const ProfileDescription = ({
                                       description,
                                       className=""
}: {
    description: string,
    className?: string
}) => {

    const rt = useMemo(() => {
        if(description && description.length > 0) {
            let rt = new RichText({
                text: description
            })
            rt.detectFacetsWithoutResolution()
            return rt
        }
    }, [description])
    if(!description || description.length === 0) return null

    return <div key={description} className={className}>
        <BskyRichTextContent
            className={"text-sm link"}
            post={{text: rt.text, facets: rt.facets}}
        />
    </div>
}