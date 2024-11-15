
import FlagIcon from '@mui/icons-material/Flag';
import BoltIcon from '@mui/icons-material/Bolt';
import MuiArticleIcon from '@mui/icons-material/Article';
import BookIcon from '@mui/icons-material/Book';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import GradeOutlinedIcon from '@mui/icons-material/GradeOutlined';
import LeaderboardIcon from '@mui/icons-material/Leaderboard'
import AbcIcon from '@mui/icons-material/Abc';
import MuiLinkIcon from '@mui/icons-material/Link';
import HomeIcon from '@mui/icons-material/Home';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import NotificationsIconMui from '@mui/icons-material/Notifications';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SendIconMui from '@mui/icons-material/Send';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import UndoIconMui from '@mui/icons-material/Undo';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIconMui from '@mui/icons-material/Cancel';
import CreateIcon from '@mui/icons-material/Create';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState } from 'react';
import { BiUpvote } from "react-icons/bi";
import { BiSolidUpvote } from "react-icons/bi";
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ArrowRightIconMui from '@mui/icons-material/ArrowRight';


export const RedFlag = () => {
    return <FlagIcon fontSize="small" className="text-red-600"/>
}


export const FastPostIcon = ({fontSize="small"}: {fontSize?: "small" | "inherit"}) => {
    return <BoltIcon fontSize={fontSize}/>
}


export const PostIcon = () => {
    return <span className="">
        <MuiArticleIcon fontSize={"small"}/>
    </span>
}


export const FastAndPostIcon = () => {
    return (
        <span className="relative inline-block text-gray-900">
            <span className="absolute bottom-[-4px] right-[-5px]">
                <PostIcon />
            </span>
            <span className="absolute top-[-12px] left-[-3px]">
                <FastPostIcon />
            </span>
        </span>
    );
};


export const ArticleIcon = () => {
    return <BookIcon fontSize={"small"}/>
}


export const CabildoIcon = ({className, fontSize}: {className?: string, fontSize?: "small" | "inherit"}) => {
    return <HomeIcon fontSize={fontSize}/>
    //return <i className={"icon cabildo "+className}/>
    /*return <div className={className}>
        <CabildoSVG height={23} width={23}/>
    </div>*/
}

export const DashboardIcon = () => {
    return <AccountBalanceIcon fontSize={"small"}/>
}

export const ActiveLikeIcon = () => {
    return <BiSolidUpvote fontSize="1.3rem"/>
}

export const InactiveLikeIcon = () => {
    return <BiUpvote fontSize="1.3rem"/>
}

export const ActivePraiseIcon = () => {
    return <BiSolidUpvote fontSize="1.3rem"/>
}

export const InactivePraiseIcon = () => {
    return <BiUpvote fontSize="1.3rem"/>
}


export const PopularIcon = () => {
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
    const [clicked, setClicked] = useState(false)

    const className = "font-bold absolute top-0 right-0 transform \
    translate-x-1/2 -translate-y-1/2 bg-red-500 text-white\
     rounded-full text-xs w-4 h-4 flex items-center justify-center"
    return <div className="relative flex" onClick={() => {setClicked(true)}}>
        <NotificationsIconMui />
        {(count && !clicked && count > 0) ?
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


export const SupportIcon = ({newCount}: {newCount?: number}) => {
    const className = "font-bold absolute top-0 right-0 transform \
    translate-x-1/2 -translate-y-1/2 bg-red-500 text-white\
     rounded-full text-xs w-4 h-4 flex items-center justify-center"
    return <div className="relative flex">
        <SupportAgentIcon />
        {(newCount != undefined && newCount > 0) ?
          <span className={className}>
            {newCount}
          </span> : <></>
        }
    </div>
}


export const SendIcon = () => {
    return <SendIconMui/>
}


export const AuthorshipClaimIcon = () => {
    return <AttachMoneyIcon/>
}


export const NoAuthorshipClaimIcon = () => {
    return <MoneyOffIcon/>
}


export const UndoIcon = () => {
    return <UndoIconMui/>
}


export const ConfirmEditIcon = () => {
    return <span className="text-green-400"><CheckCircleIcon/></span>
}


export const RejectEditIcon = () => {
    return <span className="text-red-400"><CancelIconMui/></span>
}


export const CloseButtonIconWithHover = () => {
    return <div className="rounded-lg hover:bg-[var(--secondary-light)]"><CloseIcon/></div>
}


export const CloseButtonIcon = ({fontSize="medium"}: {fontSize?: "medium" | "small" | "inherit"}) => {
    return <CloseIcon fontSize={fontSize}/>
}


export const WriteButtonIcon = () => {
    return <CreateIcon/>
}


type FontSizeType = "inherit" | "small" | "medium" | "large"


export const TipIcon = ({fontSize="inherit"}: {fontSize?: FontSizeType}) => {
    return <TipsAndUpdatesIcon fontSize={fontSize}/>
}


import ExpandMoreIconMui from '@mui/icons-material/ExpandMore';
import ExpandLessIconMui from '@mui/icons-material/ExpandLess';

export const ExpandMoreIcon = ({fontSize="inherit"}: {fontSize?: FontSizeType}) => {
    return <ExpandMoreIconMui fontSize={fontSize}/>
}


export const ExpandLessIcon = ({fontSize="inherit"}: {fontSize?: FontSizeType}) => {
    return <ExpandLessIconMui fontSize={fontSize}/>
}


export const DonateIcon = ({fontSize="inherit"}: {fontSize?: FontSizeType}) => {
    return <VolunteerActivismIcon fontSize={fontSize}/>
}


export const ArrowRightIcon = () => {
    return <ArrowRightIconMui/>
}