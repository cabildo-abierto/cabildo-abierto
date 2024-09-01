
import FlagIcon from '@mui/icons-material/Flag';
import BoltIcon from '@mui/icons-material/Bolt';
import MuiArticleIcon from '@mui/icons-material/Article';
import BookIcon from '@mui/icons-material/Book';
import CabildoSVG from "../../public/cabildo-icon-simple.svg"

export const RedFlag = () => {
    return <FlagIcon fontSize="small" className="text-red-600"/>
}


export const FastPostIcon = () => {
    return <BoltIcon fontSize={"small"}/>
}


export const PostIcon = () => {
    return <MuiArticleIcon fontSize={"small"}/>
}


export const ArticleIcon = () => {
    return <BookIcon fontSize={"small"}/>
}


export const CabildoIcon = ({className}: {className?: string}) => {
    return <i className={"icon cabildo "+className}/>
    /*return <div className={className}>
        <CabildoSVG height={23} width={23}/>
    </div>*/
}