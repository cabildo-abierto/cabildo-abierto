import { useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';

export const InfoPanel = ({text, className}: {text: string, className?: string}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="text-gray-600"
      >
        <InfoIcon fontSize="small"/>
      </div>
      {isHovered && (
        <div className={"info-panel " + (className ? className : "")}>
          <p>
            {text}
          </p>
        </div>
      )}
    </div>
  );
};

export default InfoPanel