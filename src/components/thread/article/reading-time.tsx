import AccessTimeIcon from '@mui/icons-material/AccessTime';


export const ReadingTime = ({numWords}: {numWords?: number}) => {
    if(!numWords) return null
    try {
        const wordsPerMinute = 200;
        const minutes = Math.ceil(numWords / wordsPerMinute);
        return <div className="space-x-1 flex items-baseline">
            <div className={"mt-1"}>
                <AccessTimeIcon fontSize="inherit"/>
            </div>
            <div className="text-sm">{minutes}min.</div>
        </div>
    } catch {
        return <></>
    }
}