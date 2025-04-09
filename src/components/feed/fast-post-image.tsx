"use client"
import {FastPostProps} from "@/lib/definitions";
import {useState} from "react";
import {FullscreenImageViewer} from "@/components/images/fullscreen-image-viewer";
import {ATProtoImage} from "@/components/images/atproto-image";


export const FastPostImage = ({post, did}: { post: FastPostProps; did?: string }) => {
    const [viewing, setViewing] = useState(null)

    if (!post.content.post.embed) {
        return null;
    }
    const embed = JSON.parse(post.content.post.embed);

    let images;
    if (embed.images && embed.images.length > 0) {
        images = embed.images;
    } else if (embed.media && embed.media.images && embed.media.images.length > 0) {
        images = embed.media.images;
    } else {
        return null
    }

    let imagesInPost
    const imageClass = "w-full object-cover object-top rounded-lg border";
    if (images) {
        if (images.length === 1) {
            const img = images[0];
            imagesInPost = (
                <ATProtoImage
                    img={img}
                    did={did}
                    className={`${imageClass} mt-2 h-full`}
                    onClick={() => {
                        setViewing(0)
                    }}
                />
            );
        } else if (images.length === 2) {
            imagesInPost = (
                <div className="rounded-lg mt-2 flex space-x-2 h-[268px]">
                    {images.map((img, index) => (
                        <div className={"w-1/2 h-full"} key={index}>
                            <ATProtoImage
                                img={img}
                                did={did}
                                className={`${imageClass} h-full`}
                                onClick={() => {
                                    setViewing(index)
                                }}
                            />
                        </div>
                    ))}
                </div>
            );
        } else if (images.length === 3) {
            imagesInPost = (
                <div className="rounded-xl mt-2 flex space-x-1 h-[268px]">
                    <div className="w-1/2 h-full">
                        <ATProtoImage
                            img={images[0]}
                            did={did}
                            className={imageClass + " h-full"}
                            onClick={() => {
                                setViewing(0)
                            }}
                        />
                    </div>
                    <div className="w-1/2 space-y-1 flex flex-col h-[268px]">
                        <ATProtoImage
                            img={images[1]}
                            did={did}
                            className={imageClass + " h-[132px]"}
                            onClick={() => {
                                setViewing(1)
                            }}
                        />
                        <ATProtoImage
                            img={images[2]}
                            did={did}
                            className={imageClass + " h-[132px]"}
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
                            className={imageClass + " h-full"}
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
