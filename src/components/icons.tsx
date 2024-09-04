
import FlagIcon from '@mui/icons-material/Flag';
import BoltIcon from '@mui/icons-material/Bolt';
import MuiArticleIcon from '@mui/icons-material/Article';
import BookIcon from '@mui/icons-material/Book';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';

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

export const DashboardIcon = () => {
    return <AccountBalanceIcon fontSize={"small"}/>
}

export const ActiveLikeIcon = () => {
    return <ThumbUpAltIcon fontSize="small" className="text-[var(--text-light)]"/>
}

export const InactiveLikeIcon = () => {
    return <ThumbUpOffAltIcon fontSize="small"/>
}


export const StatsIcon = () => {
    return <ShowChartIcon fontSize="small"/>
}