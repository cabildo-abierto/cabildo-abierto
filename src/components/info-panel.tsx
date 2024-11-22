import { ReactNode, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { ModalBelow } from './modal-below';

export const InfoPanel = ({text, className, iconClassName="text-gray-600", icon=<InfoIcon fontSize="small"/>}: {text: ReactNode, className?: string, iconClassName?: string, icon?: ReactNode}) => {
  const [anchorEl, setAnchorEl] = useState(null)

  return <div className="relative inline-block">
      <div
          onMouseEnter={(e) => {setAnchorEl(e.target)}}
          onMouseLeave={() => {setAnchorEl(null)}}
          className={iconClassName}
      >
        {icon}
      </div>
      <ModalBelow
          hoverOnly={true}
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          marginTop="5px"
          onClose={() => {setAnchorEl(null); console.log("closing")}}
      >
          <div
              className={"text-justify text-sm bg-[var(--background)] text-gray-900 rounded  border content-container " + (className ? className : "w-72")}
          >
              <div className="p-2">
                  {text}
              </div>
          </div>
      </ModalBelow>
  </div>
};

export default InfoPanel