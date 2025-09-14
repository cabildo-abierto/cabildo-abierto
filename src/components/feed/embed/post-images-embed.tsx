"use client"
import {ReactNode, useState} from "react";
import {ATProtoImage} from "@/components/images/atproto-image";
import dynamic from "next/dynamic";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {pxToNumber} from "@/utils/strings";
import {AppBskyEmbedImages} from "@atproto/api"


const FullscreenImageViewer = dynamic(() => import('@/components/images/fullscreen-image-viewer'), {
    ssr: false,
    loading: () => <></>
});


type PostImageEmbedProps = {
    embed: AppBskyEmbedImages.View
    did?: string
    onArticle?: boolean
}


export const PostImagesEmbed = ({embed, did, onArticle = false}: PostImageEmbedProps) => {
    const [viewing, setViewing] = useState(null)
    const {layoutConfig} = useLayoutConfig()
    let images: AppBskyEmbedImages.ViewImage[] = embed.images

    let imagesInPost: ReactNode
    if (images && images.length > 0) {
        if (images.length === 1) {
            const img = images[0];
            imagesInPost = onArticle ?
                <div className={"flex justify-center w-full"}>
                    <ATProtoImage
                        img={img}
                        onClick={() => {
                            setViewing(0)
                        }}
                        maxWidth={pxToNumber(layoutConfig.maxWidthCenter)}
                        maxHeight={400}
                        className={"cursor-pointer rounded-lg bg-[var(--background-dark)] flex w-full h-full object-contain"}
                    />
                </div> :
                <div className={"w-full"}>
                    <ATProtoImage
                        img={img}
                        onClick={() => {
                            setViewing(0)
                        }}
                        maxHeight={500}
                    />
                </div>
        } else if (images.length === 2) {
            imagesInPost = (
                <div className="flex space-x-2 h-[268px]">
                    {images.map((img, index) => (
                        <div className={"w-1/2 h-full"} key={index}>
                            <ATProtoImage
                                img={img}
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
                <div className="rounded-xl flex space-x-1 h-[268px]">
                    <div className="w-1/2 h-full">
                        <ATProtoImage
                            img={images[0]}
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
                            onClick={() => {
                                setViewing(1)
                            }}
                            cover={true}
                            className={"border rounded-lg object-cover h-[132px] w-full"}
                        />
                        <ATProtoImage
                            img={images[2]}
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
                <div className="rounded-xl grid grid-cols-2 grid-rows-2 gap-1 h-[324px]">
                    {images.slice(0, 4).map((img, index) => (
                        <ATProtoImage
                            key={index}
                            img={img}
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
        {images && images.length > 0 &&
            <FullscreenImageViewer
                images={images}
                viewing={viewing}
                setViewing={setViewing}
            />}
        {imagesInPost}
    </>
};
