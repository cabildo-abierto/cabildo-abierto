import { ReactNode, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';

/*

const Explainable = ({text, id}: {text: string, id?: string}) => {
    return <Link
        href={"#" + (id ? id : text)}
        className="hover:text-[var(--primary)] cursor-pointer">
        {text}
    </Link>
}*/

export const Explainable = ({text, content}: {text: string, content: ReactNode}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="hover:text-[var(--primary)] cursor-pointer"
      >
        {text}
      </div>
      {isHovered && (
        <div className="absolute text-base border bg-[var(--background)] z-10 w-96 p-2 explainable">
          {content}
        </div>
      )}
    </div>
  );
};

export default Explainable