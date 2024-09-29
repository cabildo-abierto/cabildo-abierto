import { ReactNode, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';

export const InfoPanel = ({text, className, iconClassName="text-gray-600"}: {text: ReactNode, className?: string, iconClassName?: string}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={iconClassName}
      >
        <InfoIcon fontSize="small"/>
      </div>
      {isHovered && (
        <div className={"info-panel text-justify text-sm " + (className ? className : "w-72")}
          onMouseEnter={() => {setIsHovered(true)}}
          onMouseLeave={() => {setIsHovered(false)}}
        >
          <p>
            {text}
          </p>
        </div>
      )}
    </div>
  );
};

export default InfoPanel