import Image from "next/image";

export const ATProtoImage = ({img, did, className = "w-full h-full", onClick}: {
    img: any, did?: string, className?: string, onClick?: (e: any) => void
}) => {
    let src: string
    let alt: string = ""
    if (typeof img === "string") {
        src = img
    } else {
        if (img.image) {
            src = "https://cdn.bsky.app/img/feed_thumbnail/plain/" + did + "/" + img.image.ref.$link + "@" + img.image.mimeType.split("/")[1]
        } else {
            src = img.thumb
            alt = img.alt
        }
    }
    return <Image
        src={src}
        alt={alt}
        width={300}
        height={300}
        className={className + (onClick ? " cursor-pointer" : "")}
        onClick={(e) => {
            e.stopPropagation()
            e.preventDefault();
            onClick(e)
            console.log("got image click!")
        }}
    />
}