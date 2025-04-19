import Image from "next/image";
import {ViewImage} from "@atproto/api/src/client/types/app/bsky/embed/images";
import {Image as BskyImage} from "@atproto/api/src/client/types/app/bsky/embed/images";


type EmbedImageProps = {
    img: ViewImage | BskyImage | string
    className?: string
    did?: string
    onClick?: (e: any) => void
    maxHeight?: number
    cover?: boolean
}


export const ATProtoImage = ({
                               img, className = "rounded-lg border", onClick, did, maxHeight=500, cover=false
                           }: EmbedImageProps) => {
    let width: number
    let height: number
    let src: string
    let alt: string
    if(typeof img === "string") {
        src = img
        alt = ""
        width = 1000
        height = 1000
    } else {
        width = img.aspectRatio.width
        height = img.aspectRatio.height
        src = "image" in img ? "https://cdn.bsky.app/img/feed_thumbnail/plain/" + did + "/" + img.image.ref.$link + "@" + img.image.mimeType.split("/")[1] : img.thumb
        alt = img.alt

        if(cover){

        } else if(height > maxHeight){
            width = width * maxHeight / height
            height = maxHeight
        }
    }


    return <>
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className + (onClick ? " cursor-pointer" : "")}
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault();
                onClick(e)
            }}
        />
    </>
}