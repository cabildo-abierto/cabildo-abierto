import Image from "next/image";

export const TwoImages = ({url1, url2, alt1, alt2}: { url1: string, alt1: string, url2: string, alt2: string }) => {
    return <div className="flex justify-center items-center w-full">
        <Image
            src={url1}
            width={300}
            height={300}
            alt={alt1}
            className="border border-[var(--text)] w-2/3 transform translate-x-[25%]"
        />
        <Image
            src={url2}
            width={300}
            height={300}
            alt={alt2}
            className="border border-[var(--text)] w-2/3 transform translate-x-[-25%] translate-y-[25%]"
        />
    </div>
}