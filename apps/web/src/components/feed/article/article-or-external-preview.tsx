import Image from "next/image";
import DomainIcon from "@/components/utils/icons/domain-icon";
import {cn} from "@/lib/utils";
import {ArticleIcon} from "@phosphor-icons/react";
import {CustomLink} from "@/components/utils/base/custom-link";

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

type ArticleOrExternalPreviewProps = {
    title?: string
    description?: string
    thumb?: string
    isArticle?: boolean
    url?: string
    onClick?: () => void
}

export const ArticleOrExternalPreview = ({
                                             title,
                                             thumb,
                                             description,
                                             url,
                                             isArticle=false,
                                             onClick
}: ArticleOrExternalPreviewProps) => {

    return <CustomLink
        tag={"div"}
        href={onClick ? undefined : url}
        target={isArticle ? undefined : "_blank"}
        className={cn("mt-1", (onClick || url) ? "cursor-pointer embed-panel" : "border border-[var(--accent)]")}
        onClick={onClick}
    >
        {thumb && thumb.length > 0 &&
            <div>
                <Image
                    src={thumb}
                    alt={""}
                    className="w-full max-h-[240px] object-cover"
                    width={400}
                    height={300}
                />
            </div>}
        <div className={cn(thumb ? "border-t px-2 pt-2 pb-1" : "pb-1 px-2 pt-2")}>
            <div className="text-[15px] font-semibold break-all">
                {title ?? url}
            </div>
            <div className="text-sm line-clamp-2 pb-1">
                {description}
            </div>
            <hr/>
            <div className="text-sm text-[var(--text-light)] pt-[2px]">
                {!isArticle ? <Domain url={url}/> :
                <div className={"flex items-center space-x-1 text-sm"}>
                    <ArticleIcon/>
                    <div>Artículo</div>
                </div>}
            </div>
        </div>
    </CustomLink>
}