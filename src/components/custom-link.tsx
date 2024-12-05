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
  draggable?: boolean
};

export function CustomLink({ href, children, className, target, rel, onMouseEnter, onMouseLeave, draggable }: CustomLinkProps) {
  const router = useRouter();
  const { leaveStoppers, setLeaveStoppers } = usePageLeave();

  const handleClick = (e: React.MouseEvent) => {
    if (leaveStoppers.size > 0) {
        const confirmLeave = window.confirm("Tenés cambios sin guardar. ¿Querés salir igualmente?");
        if (!confirmLeave) {
            e.preventDefault();
        }
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} target={target} rel={rel} onMouseEnter={onMouseEnter} draggable={draggable} onMouseLeave={onMouseLeave}>
      {children}
    </Link>
  );
}
