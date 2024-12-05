import { decompress } from "./compression"
import { getAllText } from "./diff"
import AccessTimeIcon from '@mui/icons-material/AccessTime';


export const ReadingTime = ({content}: {content: {compressedText?: string}}) => {
    if(!content.compressedText) return <></>
    try {
        const json = JSON.parse(decompress(content.compressedText))
        const text = getAllText(json.root)
        const wordsPerMinute = 200;
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return <div className="flex items-center space-x-1">
            <AccessTimeIcon fontSize="inherit"/>
            <span className="text-sm">{minutes}min.</span>
        </div>
    } catch {
        return <></>
    }
    
}