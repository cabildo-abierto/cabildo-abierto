import Image from "next/image";
import useMeasure from "react-use-measure";
import {AppBskyEmbedImages} from "@atproto/api"


type EmbedImageProps = {
    img: AppBskyEmbedImages.ViewImage | string
    className?: string
    onClick?: (e: any) => void
    maxHeight?: number | string
    maxWidth?: number | string
    cover?: boolean
}


export const ATProtoImage = ({
                                 img,
                                 className = "rounded-lg border object-cover",
                                 onClick,
                                 maxHeight = 500,
                                 maxWidth,
                                 cover = false
                             }: EmbedImageProps) => {
    const measure = useMeasure()
    const bounds = measure[1]
    if (!maxWidth) maxWidth = bounds.width ? bounds.width : undefined
    if (!maxHeight) maxHeight = bounds.height ? bounds.height : undefined
    let src: string
    let alt: string
    if (typeof img === "string") {
        src = img
        alt = ""
    } else if (img.thumb) {
        src = img.thumb
        alt = img.alt
    } else {
        return <div className={"py-4 border rounded w-full"}>
            Ocurrió un error al mostrar la imagen.
        </div>
    }

    return <>
        <Image
            src={src}
            alt={alt}
            width={1500}
            height={1500}
            quality={100}
            style={{
                maxWidth,
                maxHeight
            }}
            className={className}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClick(e);
            }}
        />
    </>
}