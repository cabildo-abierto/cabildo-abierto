"use client"
import Image from 'next/image'
import {FastPostProps} from "@/lib/definitions";
import {useEffect, useState} from "react";
import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export const FullscreenImageViewer = ({ images, viewing, did, setViewing, className="" }: {
    images: any[], viewing: number | null, did?: string, setViewing: (i: number | null) => void, className?: string
}) => {
    useEffect(() => {
        if (viewing === null) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setViewing(null);
            } else if (e.key === 'ArrowLeft' && viewing > 0) {
                setViewing(viewing - 1);
            } else if (e.key === 'ArrowRight' && viewing < images.length - 1) {
                setViewing(viewing + 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [viewing, images.length, setViewing]);

    if (viewing === null) {
        return null;
    }

    return (
        <div
            onClick={(e) => {e.stopPropagation(); setViewing(null)}}
            className="bg-black bg-opacity-50 inset-0 h-screen w-screen fixed z-[1021] flex justify-center items-center"
        >
            <div className="w-24 px-2">
                {viewing > 0 ? (
                    <IconButton onClick={(e) => { e.stopPropagation(); setViewing(viewing - 1); }}>
                        <ArrowBackIosNewIcon />
                    </IconButton>
                ) : null}
            </div>
            <ATProtoImage
                img={images[viewing]}
                did={did}
                className={"max-w-[80vh] max-h-[80vh] object-contain " + className}
                onClick={(e) => e.stopPropagation()}
            />
            <div className="w-24 px-2">
                {viewing < images.length - 1 ? (
                    <IconButton onClick={(e) => { e.stopPropagation(); setViewing(viewing + 1); }}>
                        <ArrowForwardIosIcon />
                    </IconButton>
                ) : null}
            </div>
        </div>
    );
};


export const ATProtoImage = ({img, did, className="w-full h-full", onClick}: {
    img: any, did?: string, className?: string, onClick?: (e: any) => void}) => {
    if(typeof img === "string"){
        return <Image
            src={img}
            alt={""}
            width={300}
            height={300}
            className={className + (onClick ? " cursor-pointer": "")}
            onClick={(e) => {e.stopPropagation(); onClick(e)}}/>
    }
    if(img.image){
        const src = "https://cdn.bsky.app/img/feed_thumbnail/plain/"+did+"/"+img.image.ref.$link+"@"+img.image.mimeType.split("/")[1]
        return <Image
            src={src}
            alt={img.alt}
            width={img.aspectRatio ? img.aspectRatio.width : 300}
            height={img.aspectRatio ? img.aspectRatio.height : 300}
            className={className + (onClick ? " cursor-pointer": "")}
            onClick={(e) => {e.stopPropagation(); onClick(e)}}
        />
    }
    return <Image
        src={img.thumb}
        alt={img.alt}
        width={img.aspectRatio ? img.aspectRatio.width : 300}
        height={img.aspectRatio ? img.aspectRatio.height : 300}
        className={className + (onClick ? " cursor-pointer": "")}
        onClick={(e) => {e.stopPropagation(); onClick(e)}}
    />
}


export const FastPostImage = ({ post, did }: { post: FastPostProps; did?: string }) => {
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
                    onClick={() => {setViewing(0)}}
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
                                onClick={() => {setViewing(index)}}
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
                            onClick={() => {setViewing(0)}}
                        />
                    </div>
                    <div className="w-1/2 space-y-1 flex flex-col h-[268px]">
                        <ATProtoImage
                            img={images[1]}
                            did={did}
                            className={imageClass + " h-[132px]"}
                            onClick={() => {setViewing(1)}}
                        />
                        <ATProtoImage
                            img={images[2]}
                            did={did}
                            className={imageClass + " h-[132px]"}
                            onClick={() => {setViewing(2)}}
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
                            onClick={() => {setViewing(index)}}
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
