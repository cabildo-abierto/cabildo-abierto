import AccessTimeIcon from '@mui/icons-material/AccessTime';


export const ReadingTime = ({numWords}: {numWords?: number}) => {
    if(!numWords) return null
    try {
        const wordsPerMinute = 200;
        const minutes = Math.ceil(numWords / wordsPerMinute);
        return <div className="flex items-start space-x-1">
            <AccessTimeIcon fontSize="inherit"/>
            <span className="text-sm">{minutes}min.</span>
        </div>
    } catch {
        return <></>
    }
}