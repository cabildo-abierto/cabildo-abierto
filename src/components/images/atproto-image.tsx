import Image from "next/image";
import {ViewImage} from "@/lex-api/types/app/bsky/embed/images";


type EmbedImageProps = {
    img: ViewImage | string
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
    } else if(img.thumb) {
        src = img.thumb
        alt = img.alt
        if(img.aspectRatio){
            width = img.aspectRatio.width
            height = img.aspectRatio.height

            if(cover){

            } else if(height > maxHeight){
                width = width * maxHeight / height
                height = maxHeight
            }
        } else {
            width = 300
            height = 300
            className = className + " w-full h-full"
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
            className={className + (onClick ? " cursor-pointer" : "")}
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault();
                onClick(e)
            }}
        />
    </>
}