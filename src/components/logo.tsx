import Link from "next/link"
import Image from 'next/image'

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
    return <div className="hover:bg-[var(--secondary-light)] rounded-lg h-10 py-1 px-2 w-24 ml-1 flex justify-center items-center">
        <Link href="/">
            <div className="flex items-center">
                <Image
                    src={pathLogo}
                    alt="Loading..."
                    width={320}
                    height={320}
                    priority={true}
                    className="w-8 h-8 rounded-sm"
                />
                <div className="ml-1 text-xs text-gray-900">
                    <div>Cabildo</div>
                    <div>Abierto</div>
                </div>
            </div>
        </Link>
    </div>
}