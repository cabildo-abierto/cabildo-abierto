import { ReactNode, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { ModalBelow } from './modal-below';

export const InfoPanel = ({text, className, iconClassName="text-gray-600", icon=<InfoIcon fontSize="small"/>}: {text: ReactNode, className?: string, iconClassName?: string, icon?: ReactNode}) => {
  const [isHovered, setIsHovered] = useState(false);

  return <div className="relative inline-block">
      <div
        onMouseEnter={() => {setIsHovered(true);}}
        onMouseLeave={() => {setIsHovered(false);}}
        className={iconClassName}
      >
        {icon}
      </div>
      {isHovered && 
        <ModalBelow
          className={"text-justify text-sm bg-[var(--background)] text-gray-900 rounded border z-50 border-b-2 border-r-2 " + (className ? className : "w-72")}
          open={isHovered}
          setOpen={setIsHovered}
          hoverOnly={true}
        >
          <div className="p-1 z-50">{text}</div>
        </ModalBelow>
      }
    </div>
};

export default InfoPanel