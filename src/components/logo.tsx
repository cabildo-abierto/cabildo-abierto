import Link from "next/link"
import Image from 'next/image'

export const LogoWithName = ({showName}: {showName: boolean}) => {
    return <div><Link href="/"><div className="flex items-center ml-1">
        <Image
          src="/cabildo-icono.svg"
          alt="Loading..."
          width={314}
          height={314}
          priority={true}
          className="w-10 h-10"
        />
        {showName && <div className="ml-1 items-end text-lg text-gray-900 hidden sm:flex">
            <div>Cabildo Abierto</div>
        </div>}
    </div></Link></div>
}



export const Logo = ({className, opacity=1}: {className: string, opacity?: number}) => {
    return <Image
          src="/cabildo-icono.svg"
          alt="Loading..."
          width={397}
          height={397}
          priority={true}
          className={"object-contain "+className}
          style={{opacity: opacity}}
    />
}