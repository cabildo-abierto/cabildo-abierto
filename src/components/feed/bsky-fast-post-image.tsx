"use client"
import { FeedContentProps } from "../../app/lib/definitions"
import Image from 'next/image'


export const BskyFastPostImage = ({content}: {content: FeedContentProps}) => {

    let images
    if(content.embed && content.embed.images && content.embed.images.length > 0){
        images = content.embed.images
    } else if(content.embed && content.embed.media && content.embed.media.images && content.embed.media.images.length > 0){
        images = content.embed.media.images
    }

    console.log("images", images)

    if(images){
        if(images.length == 1){
            const img = images[0]
            return <Image
                src={img.thumb}
                alt={img.alt}
                width={img.aspectRatio ? img.aspectRatio.width : undefined}
                height={img.aspectRatio ? img.aspectRatio.height : undefined}
                className="rounded-lg border mt-2"
            />
        } else if(images.length == 2){

            return <div className="rounded-lg border mt-2 flex space-x-2">
                <Image
                src={images[0].thumb}
                alt={images[0].alt}
                width={images[0].aspectRatio ? images[0].aspectRatio.width : undefined}
                height={images[0].aspectRatio ? images[0].aspectRatio.height : undefined}
                className="rounded-lg border mt-2 w-1/2"
                />
                <Image
                src={images[1].thumb}
                alt={images[1].alt}
                width={images[1].aspectRatio ? images[1].aspectRatio.width : undefined}
                height={images[1].aspectRatio ? images[1].aspectRatio.height : undefined}
                className="rounded-lg border mt-2 w-1/2"
                />
            </div>

        } else if(images.length == 3){
            return <div className="rounded-xl mt-2 flex space-x-1">
                <div className="w-1/2 space-x-2">
                    <Image
                    src={images[0].thumb}
                    alt={images[0].alt}
                    width={images[0].aspectRatio ? images[0].aspectRatio.width : undefined}
                    height={images[0].aspectRatio ? images[0].aspectRatio.height : undefined}
                    className="rounded border h-full w-full"
                    />
                </div>
                <div className="w-1/2 space-y-1 flex flex-col">
                    <Image
                    src={images[1].thumb}
                    alt={images[1].alt}
                    width={images[1].aspectRatio ? images[1].aspectRatio.width : undefined}
                    height={images[1].aspectRatio ? images[1].aspectRatio.height : undefined}
                    className="rounded border h-1/2"
                    />
                    <Image
                    src={images[2].thumb}
                    alt={images[2].alt}
                    width={images[2].aspectRatio ? images[2].aspectRatio.width : undefined}
                    height={images[2].aspectRatio ? images[2].aspectRatio.height : undefined}
                    className="rounded border h-1/2"
                    />
                </div>
            </div>
        } else if(images.length == 4){
            
            return <div className="rounded-xl mt-2 flex space-y-1 flex flex-col">
                <div className="h-1/2 space-x-1 w-full flex">
                    <Image
                    src={images[0].thumb}
                    alt={images[0].alt}
                    width={images[0].aspectRatio ? images[0].aspectRatio.width : undefined}
                    height={images[0].aspectRatio ? images[0].aspectRatio.height : undefined}
                    className="rounded border w-1/2"
                    />
                    <Image
                    src={images[1].thumb}
                    alt={images[1].alt}
                    width={images[1].aspectRatio ? images[1].aspectRatio.width : undefined}
                    height={images[1].aspectRatio ? images[1].aspectRatio.height : undefined}
                    className="rounded border w-1/2"
                    />
                </div>
                <div className="h-1/2 space-x-1 w-full flex">
                    <Image
                    src={images[2].thumb}
                    alt={images[2].alt}
                    width={images[2].aspectRatio ? images[2].aspectRatio.width : undefined}
                    height={images[2].aspectRatio ? images[2].aspectRatio.height : undefined}
                    className="rounded border w-1/2"
                    />
                    <Image
                    src={images[3].thumb}
                    alt={images[3].alt}
                    width={images[3].aspectRatio ? images[3].aspectRatio.width : undefined}
                    height={images[3].aspectRatio ? images[3].aspectRatio.height : undefined}
                    className="rounded border w-1/2"
                    />
                </div>
            </div>
        }
    }

    return <></>
}