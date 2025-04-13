"use client"
import {FastPostProps} from "@/lib/definitions";
import {useState} from "react";
import {FullscreenImageViewer} from "@/components/images/fullscreen-image-viewer";
import {ATProtoImage} from "@/components/images/atproto-image";
import {AppBskyEmbedImages, AppBskyEmbedRecordWithMedia} from "@atproto/api";
import {ViewImage} from "@atproto/api/src/client/types/app/bsky/embed/images";
import {Image} from "@atproto/api/src/client/types/app/bsky/embed/images";


export const FastPostImages = ({post, did}: { post: FastPostProps; did?: string }) => {
    const [viewing, setViewing] = useState(null)

    if (!post.content.post.embed) {
        return null;
    }
    const embed = JSON.parse(post.content.post.embed)

    let embedImages: AppBskyEmbedImages.Main
    if(embed.$type == "app.bsky.embed.images"){
        embedImages = embed as AppBskyEmbedImages.Main
    } else if(embed.$type == "app.bsky.embed.recordWithMedia") {
        const embedRecordWithMedia = (embed as AppBskyEmbedRecordWithMedia.Main)
        if(embedRecordWithMedia.media.$type == "app.bsky.embed.images") {
            embedImages = embedRecordWithMedia.media as AppBskyEmbedImages.Main
        } else {
            return null
        }
    } else {
        return null
    }

    let images: (Image | ViewImage)[]
    if (embedImages && embedImages.images && embedImages.images.length > 0) {
        images = embedImages.images
    }

    let imagesInPost

    if(images && images.length != 1) return null

    if (images) {
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
                <div className="rounded-lg mt-2 flex space-x-2 h-[268px]">
                    {images.map((img, index) => (
                        <div className={"w-1/2 h-full"} key={index}>
                            <ATProtoImage
                                img={img}
                                did={did}
                                onClick={() => {
                                    setViewing(index)
                                }}
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
                        />
                    </div>
                    <div className="w-1/2 space-y-1 flex flex-col h-[268px]">
                        <ATProtoImage
                            img={images[1]}
                            did={did}
                            onClick={() => {
                                setViewing(1)
                            }}
                        />
                        <ATProtoImage
                            img={images[2]}
                            did={did}
                            onClick={() => {
                                setViewing(2)
                            }}
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
                        />
                    ))}
                </div>
            );
        }
    }

    return <>
        <FullscreenImageViewer did={did} images={images} viewing={viewing} setViewing={setViewing}/>
        {imagesInPost}
    </>
};
