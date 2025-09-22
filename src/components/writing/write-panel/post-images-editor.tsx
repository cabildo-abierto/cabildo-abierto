import Image from 'next/image'
import {CloseButton} from '../../../../modules/ui-utils/src/close-button'
import {useState} from "react";
import {ImagePayload} from './write-post';
import dynamic from "next/dynamic";
const FullscreenImageViewer = dynamic(() => import('@/components/layout/images/fullscreen-image-viewer'));

type PostImagesEditorProps = {
    images: ImagePayload[],
    setImages: (images: ImagePayload[]) => void
}

export const PostImagesEditor = ({images, setImages}: PostImagesEditorProps) => {
    const [viewing, setViewing] = useState<number | null>(null)

    return <>
        <FullscreenImageViewer
            images={images.map(i => i.src)}
            viewing={viewing}
            setViewing={setViewing}
        />
        <div className="flex w-full bg-[var(--secondary-light)] space-x-2">
            {images.map((i, index) => {
                return <div className="flex justify-center rounded-lg" key={index}>
                    <div className={"relative"}>
                        <div className="absolute top-2 right-2">
                            <CloseButton
                                onClose={() => {
                                    setImages([...images.slice(0, index), ...images.slice(index + 1)])
                                }}
                                color={"background-dark"}
                                size={"small"}
                            />
                        </div>
                        <Image
                            onClick={(e) => {
                                e.stopPropagation()
                                setViewing(index)
                            }}
                            className="z-[1] border rounded-lg cursor-pointer h-[200px] object-cover"
                            src={i.src}
                            width={350}
                            height={350}
                            alt={""}
                        />
                    </div>
                </div>
            })}
        </div>
    </>
}