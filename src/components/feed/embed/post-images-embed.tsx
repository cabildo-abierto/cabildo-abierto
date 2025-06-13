"use client"
import {ReactNode, useState} from "react";
import {ATProtoImage} from "@/components/images/atproto-image";
import {ViewImage} from "@atproto/api/src/client/types/app/bsky/embed/images";
import {View as EmbedImagesView} from "@/lex-api/types/app/bsky/embed/images"
import dynamic from "next/dynamic";
const FullscreenImageViewer = dynamic(() => import('@/components/images/fullscreen-image-viewer'));


type PostImageEmbedProps = {
    embed: EmbedImagesView
    did?: string
    onArticle?: boolean
}


export const PostImagesEmbed = ({embed, did, onArticle=false}: PostImageEmbedProps) => {
    const [viewing, setViewing] = useState(null)
    let images: ViewImage[] = embed.images

    let imagesInPost: ReactNode
    if (images && images.length > 0) {
        if (images.length === 1) {
            const img = images[0];
            imagesInPost = (
                <div className="mt-2">
                    <ATProtoImage
                        img={img}
                        did={did}
                        onClick={() => {
                            setViewing(0)
                        }}
                    />
                </div>
            );
        } else if (images.length === 2) {
            imagesInPost = (
                <div className="mt-2 flex space-x-2 h-[268px]">
                    {images.map((img, index) => (
                        <div className={"w-1/2 h-full"} key={index}>
                            <ATProtoImage
                                img={img}
                                did={did}
                                onClick={() => {
                                    setViewing(index)
                                }}
                                cover={true}
                                className={"border rounded-lg object-cover h-full w-full"}
                            />
                        </div>
                    ))}
                </div>
            )
        } else if (images.length === 3) {
            imagesInPost = (
                <div className="rounded-xl mt-2 flex space-x-1 h-[268px]">
                    <div className="w-1/2 h-full">
                        <ATProtoImage
                            img={images[0]}
                            did={did}
                            onClick={() => {
                                setViewing(0)
                            }}
                            cover={true}
                            className={"border rounded-lg object-cover h-full w-full"}
                        />
                    </div>
                    <div className="w-1/2 space-y-1 flex flex-col justify-between h-[268px]">
                        <ATProtoImage
                            img={images[1]}
                            did={did}
                            onClick={() => {
                                setViewing(1)
                            }}
                            cover={true}
                            className={"border rounded-lg object-cover h-[132px] w-full"}
                        />
                        <ATProtoImage
                            img={images[2]}
                            did={did}
                            onClick={() => {
                                setViewing(2)
                            }}
                            cover={true}
                            className={"border rounded-lg object-cover h-[132px] w-full"}
                        />
                    </div>
                </div>
            );
        } else if (images.length === 4) {
            imagesInPost = (
                <div className="rounded-xl mt-2 grid grid-cols-2 grid-rows-2 gap-1 h-[324px]">
                    {images.slice(0, 4).map((img, index) => (
                        <ATProtoImage
                            key={index}
                            img={img}
                            did={did}
                            onClick={() => {
                                setViewing(index)
                            }}
                            cover={true}
                            className={"border rounded-lg object-cover h-[160px] w-full"}
                        />
                    ))}
                </div>
            );
        }
    }

    return <>
        {images && images.length > 0 && <FullscreenImageViewer did={did} images={images} viewing={viewing} setViewing={setViewing}/>}
        {imagesInPost}
    </>
};
