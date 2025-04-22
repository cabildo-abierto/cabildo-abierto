import Image from 'next/image'
import { CloseButton } from '../../../../modules/ui-utils/src/close-button'



export const FastPostImagesEditor = ({images, setImages}) => {
    return <div className="flex justify-center w-full bg-[var(--secondary-light)] space-x-2 px-2">
        {images.map((i, index) => {
            return <div className="flex justify-center my-2 border rounded-lg p-1" key={index}>
                <div>
                    <div className="flex justify-end pb-1">
                        <CloseButton
                            onClose={() => {setImages([...images.slice(0, index), ...images.slice(index+1)])}}
                            size={"small"}
                        />
                    </div>
                    <Image
                        className="border rounded-lg"
                        src={i.src}
                        width={350}
                        height={350}
                        alt={i.altText ? "no alt" : ""}
                    />
                </div>
            </div>
        })}
    </div>
}