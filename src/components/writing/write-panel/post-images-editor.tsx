import Image from 'next/image'
import {CloseButton} from '../../../../modules/ui-utils/src/close-button'
import {useState} from "react";
import {FullscreenImageViewer} from "@/components/images/fullscreen-image-viewer";
import { ImagePayload } from './write-post';
import {PrettyJSON} from "../../../../modules/ui-utils/src/pretty-json";

type PostImagesEditorProps = {
    images: ImagePayload[],
    setImages: (images: ImagePayload[]) => void
}

export const PostImagesEditor = ({images, setImages}: PostImagesEditorProps) => {
    const [viewing, setViewing] = useState<number | null>(null)

    return <>
        <FullscreenImageViewer images={images.map(i => i.$type == "url" ? i.src : i.image)} viewing={viewing} setViewing={setViewing}/>
        <div className="flex justify-center w-full bg-[var(--secondary-light)] space-x-2 px-2">
        {images.map((i, index) => {
            return <div className="flex justify-center my-2 border rounded-lg p-1" key={index}>
                <div>
                    <div className="flex justify-end pb-1">
                        <CloseButton
                            onClose={() => {
                                setImages([...images.slice(0, index), ...images.slice(index + 1)])
                            }}
                            size={"small"}
                        />
                    </div>
                    <Image
                        onClick={() => {setViewing(index)}}
                        className="border rounded-lg cursor-pointer"
                        src={i.$type == "url" ? i.src : i.image}
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