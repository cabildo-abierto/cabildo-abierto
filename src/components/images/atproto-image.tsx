import Image from "next/image";
import {ViewImage} from "@/lex-api/types/app/bsky/embed/images";
import useMeasure from "react-use-measure";


type EmbedImageProps = {
    img: ViewImage | string
    className?: string
    did?: string
    onClick?: (e: any) => void
    maxHeight?: number
    maxWidth?: number
    cover?: boolean
}


export const ATProtoImage = ({
                               img, className = "rounded-lg border", onClick, did, maxHeight=500, maxWidth, cover=false
                           }: EmbedImageProps) => {
    const measure = useMeasure()
    const bounds = measure[1]
    if(!maxWidth) maxWidth = bounds.width ? bounds.width : undefined
    if(!maxHeight) maxHeight = bounds.height ? bounds.height : undefined
    let width: number
    let height: number
    let src: string
    let alt: string
    if(typeof img === "string") {
        src = img
        alt = ""
        width = maxWidth ?? 1000
        height = maxHeight ?? maxWidth ?? 1000
    } else if(img.thumb) {
        src = img.thumb
        alt = img.alt
        if(img.aspectRatio){
            width = img.aspectRatio.width
            height = img.aspectRatio.height

            if(cover){

            } else if(maxHeight && !maxWidth){
                if(height > maxHeight){
                    width = width * maxHeight / height
                    height = maxHeight
                }
            } else if(maxWidth && !maxHeight){
                if(width > maxWidth) {
                    height = height * maxWidth / width
                    width = maxWidth
                }
            } else if(maxWidth && maxHeight){
                const widthWithMaxHeight = width * maxHeight / height
                if(widthWithMaxHeight > maxWidth){
                    if(width > maxWidth) {
                        height = height * maxWidth / width
                        width = maxWidth
                    }
                } else {
                    if(height > maxHeight){
                        width = width * maxHeight / height
                        height = maxHeight
                    }
                }
            }
        } else {
            width = maxWidth && maxWidth > 0 ? maxWidth : 1000
            height = maxHeight ?? (maxWidth ?? (bounds.height ?? 300))
            className += " object-cover"
        }
    } else {
        return <div className={"py-4 border rounded w-full"}>
            Ocurrió un error al mostrar la imagen.
        </div>
    }

    return <>
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            style={{maxHeight, maxWidth}}
            className={className + (onClick ? " cursor-pointer" : "")}
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault();
                onClick(e)
            }}
        />
    </>
}