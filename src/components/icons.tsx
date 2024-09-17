
import FlagIcon from '@mui/icons-material/Flag';
import BoltIcon from '@mui/icons-material/Bolt';
import MuiArticleIcon from '@mui/icons-material/Article';
import BookIcon from '@mui/icons-material/Book';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GradeOutlinedIcon from '@mui/icons-material/GradeOutlined';
import GradeIcon from '@mui/icons-material/Grade';
import LeaderboardIcon from '@mui/icons-material/Leaderboard'
import CommentIcon from '@mui/icons-material/Comment';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import AbcIcon from '@mui/icons-material/Abc';
import MuiLinkIcon from '@mui/icons-material/Link';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HomeIcon from '@mui/icons-material/Home';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import NotificationsIconMui from '@mui/icons-material/Notifications';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';


import VisibilityIcon from '@mui/icons-material/Visibility';
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
    return <HomeIcon/>
    //return <i className={"icon cabildo "+className}/>
    /*return <div className={className}>
        <CabildoSVG height={23} width={23}/>
    </div>*/
}

export const DashboardIcon = () => {
    return <AccountBalanceIcon fontSize={"small"}/>
}

export const ActiveLikeIcon = () => {
    return <FavoriteIcon fontSize="small"/>
}

export const InactiveLikeIcon = () => {
    return <FavoriteBorderIcon fontSize="small"/>
}

export const ActivePraiseIcon = () => {
    return <GradeIcon fontSize="small"/>
}

export const InactivePraiseIcon = () => {
    return <GradeOutlinedIcon fontSize="small"/>
}


export const StatsIcon = () => {
    return <ShowChartIcon fontSize="small"/>
}


export const ScoreboardIcon = () => {
    return <LeaderboardIcon fontSize="small"/>
}


export const ActiveCommentIcon = () => {
    return <ChatBubbleIcon fontSize="small"/>
}


export const InactiveCommentIcon = () => {
    return <ChatBubbleOutlineIcon fontSize="small"/>
}


export const ViewsIcon = () => {
    return <VisibilityIcon fontSize="small"/>
}


export const TextLengthIcon = () => {
    return <AbcIcon fontSize="small"/>
}


export const LinkIcon = () => {
    return <MuiLinkIcon fontSize="small"/>
}

export const NotificationsIcon = ({ count }: { count?: number }) => {
    const className = "font-bold absolute top-0 right-0 transform \
    translate-x-1/2 -translate-y-1/2 bg-red-500 text-white\
     rounded-full text-xs w-4 h-4 flex items-center justify-center"
    return <div className="relative flex">
        <NotificationsIconMui />
        {(count && count > 0) ?
          <span className={className}>
            {count}
          </span> : <></>
        }
    </div>
}


export const ManageAccountIcon = () => {
    return <ManageAccountsIcon/>
}


export const RecentIcon = () => {
    return <ScheduleIcon fontSize="small"/>
}


export const PopularIcon = () => {
    return <ActivePraiseIcon/>
}