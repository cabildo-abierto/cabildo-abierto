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
  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <Link href={"#"+text.replaceAll(" ", "_")} className="hover:text-[var(--primary)] cursor-pointer fancy-text">
        {text}
      </Link>
    </div>
  );
};


export default Explainable