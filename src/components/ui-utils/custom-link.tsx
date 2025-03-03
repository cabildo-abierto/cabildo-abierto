"use client"
import { useRouter } from "next/navigation";
import Link from 'next/link'
import { usePageLeave } from "./prevent-leave";

type CustomLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string
  target?: string
  rel?: string
  onMouseEnter?: any
  onMouseLeave?: any
  onClick?: any
  draggable?: boolean
  style?: any
};

export function CustomLink({
         href, children, className, onClick, target, rel, onMouseEnter, onMouseLeave, draggable, style }: CustomLinkProps) {
  const { leaveStoppers } = usePageLeave()

  const handleClick = (e: React.MouseEvent) => {
    if (leaveStoppers.size > 0) {
        const confirmLeave = window.confirm("Tenés cambios sin guardar. ¿Querés salir igualmente?");
        if (!confirmLeave) {
            e.preventDefault();
        }
    }
    onClick && onClick(e)
  };

  if(!href && !onClick){
      return <div
        className={className}
      >
          {children}
      </div>
  }

  return (
    <Link href={href}
          onClick={handleClick}
          className={className}
          target={target}
          rel={rel}
          onMouseEnter={onMouseEnter}
          draggable={draggable}
          onMouseLeave={onMouseLeave}
          style={style}
    >
      {children}
    </Link>
  );
}
