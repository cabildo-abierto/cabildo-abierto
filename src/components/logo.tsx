import Link from "next/link"
import Image from 'next/image'

export const pathLogo = "/logo.svg"

export const LogoWithName = ({showName}: {showName: boolean}) => {
    return <div><Link href="/"><div className="flex items-center ml-1">
        <Image
          src={pathLogo}
          alt="Loading..."
          width={314}
          height={314}
          priority={true}
          className="w-10 h-10 rounded"
        />
        {showName && <div className="ml-1 items-end text-lg text-gray-900 hidden sm:flex">
            <div>Cabildo Abierto</div>
        </div>}
    </div></Link></div>
}



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
    return <div className="hover:bg-[var(--secondary-light)] rounded-lg h-10 py-1 px-2 w-24 flex justify-center items-center">
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