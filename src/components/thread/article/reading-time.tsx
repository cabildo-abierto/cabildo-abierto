import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionOnHover from "../../../../modules/ui-utils/src/description-on-hover";


export const ReadingTime = ({numWords}: { numWords?: number }) => {
    if (!numWords) return null
    try {
        const wordsPerMinute = 200;
        const minutes = Math.ceil(numWords / wordsPerMinute);
        return <DescriptionOnHover description={"Tiempo de lectura estimado."}>
            <div className="space-x-1 flex items-baseline">
                <div className={"mt-1"}>
                    <AccessTimeIcon fontSize="inherit"/>
                </div>
                <div className="text-sm">{minutes}min.</div>
            </div>
        </DescriptionOnHover>
    } catch {
        return <></>
    }
}