import { useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';

export const Explainable = ({text, id, content}: {text: string, id?: string, content: string}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {text}
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

export default Explainable