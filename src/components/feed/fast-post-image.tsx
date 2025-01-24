"use client"
import Image from 'next/image'
import {FastPostProps} from "../../app/lib/definitions";


export const ATProtoImage = ({img, did, className="w-full h-full"}: {img: any, did?: string, className?: string}) => {
    if(img.image){
        const src = "https://cdn.bsky.app/img/feed_thumbnail/plain/"+did+"/"+img.image.ref.$link+"@"+img.image.mimeType.split("/")[1]
        return <Image
            src={src}
            alt={img.alt}
            width={img.aspectRatio ? img.aspectRatio.width : 300}
            height={img.aspectRatio ? img.aspectRatio.height : 300}
            className={className}
        />
    }
    return <Image
        src={img.thumb}
        alt={img.alt}
        width={img.aspectRatio ? img.aspectRatio.width : 300}
        height={img.aspectRatio ? img.aspectRatio.height : 300}
        className={className}
    />
}


export const FastPostImage = ({post, did}: {post: FastPostProps, did?: string}) => {

    if(!post.content.post.embed){
        return null
    }
    const embed = JSON.parse(post.content.post.embed)

    let images
    if(embed.images && embed.images.length > 0){
        images = embed.images
    } else if(embed.media && embed.media.images && embed.media.images.length > 0){
        images = embed.media.images
    }

    if(images){
        if(images.length == 1){
            const img = images[0]
            return <ATProtoImage img={img} did={did} className={"w-full h-auto mt-2 rounded-lg border"}/>
        } else if(images.length == 2){

            return <div className="rounded-lg border mt-2 flex space-x-2">
                <ATProtoImage
                    img={images[0]}
                    did={did}
                    className="rounded-lg border mt-2 w-1/2"
                />
                <ATProtoImage
                    img={images[1]}
                    did={did}
                    className="rounded-lg border mt-2 w-1/2"
                />
            </div>

        } else if(images.length == 3){
            return <div className="rounded-xl mt-2 flex space-x-1">
                <div className="w-1/2 space-x-2">
                    <ATProtoImage
                        img={images[0]}
                        did={did}
                        className="rounded border h-full w-full"
                    />
                </div>
                <div className="w-1/2 space-y-1 flex flex-col">
                    <ATProtoImage
                        img={images[1]}
                        did={did}
                        className="rounded border h-1/2"
                    />
                    <ATProtoImage
                        img={images[2]}
                        did={did}
                        className="rounded border h-1/2"
                    />
                </div>
            </div>
        } else if(images.length == 4){
            
            return <div className="rounded-xl mt-2 flex space-y-1 flex-col">
                <div className="h-1/2 space-x-1 w-full flex">
                    <ATProtoImage
                        img={images[0]}
                        did={did}
                        className="rounded border w-1/2"
                    />
                    <ATProtoImage
                        img={images[1]}
                        did={did}
                        className="rounded border w-1/2"
                    />
                </div>
                <div className="h-1/2 space-x-1 w-full flex">
                    <ATProtoImage
                        img={images[1]}
                        did={did}
                        className="rounded border w-1/2"
                    />
                    <ATProtoImage
                        img={images[1]}
                        did={did}
                        className="rounded border w-1/2"
                    />
                </div>
            </div>
        }
    }

    return <></>
}