import {ClockIcon} from "@phosphor-icons/react";
import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";


export const ReadingTime = ({numWords}: { numWords?: number }) => {
    if (!numWords) return null
    try {
        const wordsPerMinute = 200;
        const minutes = Math.ceil(numWords / wordsPerMinute);
        return <DescriptionOnHover description={"Tiempo de lectura estimado."}>
            <div className="space-x-1 flex items-center">
                <ClockIcon weight={"light"}/>
                <div className="text-sm">{minutes}min.</div>
            </div>
        </DescriptionOnHover>
    } catch {
        return <></>
    }
}