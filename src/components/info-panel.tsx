import { useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';

export const InfoPanel = ({text}: {text: string}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <InfoIcon/>
      </div>
      {isHovered && (
        <div className="info-panel">
          <p>
            {text}
          </p>
        </div>
      )}
    </div>
  );
};

export default InfoPanel