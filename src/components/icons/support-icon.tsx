
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

export const SupportIcon = ({newCount, color}: {newCount?: number, color?: "inherit"}) => {
    const className = "font-bold absolute top-0 right-0 transform \
    translate-x-1/2 -translate-y-1/2 bg-red-500 text-white\
     rounded-full text-xs w-4 h-4 flex items-center justify-center"
    return <div className="relative flex">
        <SupportAgentIcon color={color} fontSize={"small"}/>
        {(newCount != undefined && newCount > 0) ?
          <span className={className}>
            {newCount}
          </span> : <></>
        }
    </div>
}