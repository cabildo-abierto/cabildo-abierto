import Image from 'next/image'
import { IconButton } from "@mui/material"
import Link from "next/link";

export const pathLogo = "/logo.svg"


export const Logo = ({
    className,
    imageClassName="",
    opacity = 1,
  }: {
    className: string
    imageClassName?: string
    opacity?: number
  }) => {
    return (
      <div className={`relative inline-block ${className}`}>
        <Image
          src={pathLogo}
          alt="Loading..."
          width={397}
          height={397}
          priority={true}
          className={"object-contain " + imageClassName}
          style={{ opacity: opacity }}
        />
      </div>
    );
};


export function TopbarLogo({className="w-8 h-8"}: {className?: string}) {
    return <Link href="/public">
        <IconButton className="relative">
            <Logo
                className={className}
                imageClassName="rounded-sm"
            />
        </IconButton>
    </Link>
}