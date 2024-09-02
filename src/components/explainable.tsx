import { ReactNode, useEffect, useRef, useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import Link from 'next/link';

/*

const Explainable = ({text, id}: {text: string, id?: string}) => {
    return <Link
        href={"#" + (id ? id : text)}
        className="hover:text-[var(--primary)] cursor-pointer">
        {text}
    </Link>
}*/


export const Explainable = ({ text, content }: { text: string, content: ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ left: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const [wasHovered, setWasHovered] = useState(true);

  useEffect(() => {
    if (isHovered && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      if (rect.right > viewportWidth) {
        setPosition({ left: -(rect.right - viewportWidth + 10)}) // 10px padding to keep it within the viewport
      }
    }
  }, [isHovered]);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => {setIsHovered(true); setWasHovered(true)}}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={"#"+text.replaceAll(" ", "_")} className="hover:text-[var(--primary)] cursor-pointer fancy-text">
        {text}
      </Link>
      {(isHovered && false) && (
        <div
          ref={panelRef}
          className="mt-1 absolute text-base border bg-white z-10 w-96 p-2 explainable"
          style={{ ...position }}
        >
          {content}
        </div>
      )}
    </div>
  );
};


export default Explainable