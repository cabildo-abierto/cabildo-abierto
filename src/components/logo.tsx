import Link from "next/link"
import Image from 'next/image'
import { Button, IconButton } from "@mui/material"

export const pathLogo = "/logo.svg"


export const Logo = ({className, opacity=1}: {className: string, opacity?: number}) => {
    return <Image
          src={pathLogo}
          alt="Loading..."
          width={397}
          height={397}
          priority={true}
          className={"object-contain "+className}
          style={{opacity: opacity}}
    />
}


export function TopbarLogo() {
    return <Link href="/">
        <IconButton>
            <Image
                src={pathLogo}
                alt="Loading..."
                width={320}
                height={320}
                priority={true}
                className="w-8 h-8 rounded-sm"
            />
        </IconButton>
    </Link>
}