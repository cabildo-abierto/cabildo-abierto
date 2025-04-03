import Image from 'next/image'
export const pathLogo = "/logo.png"


export const Logo = ({
    width=64, height=64, className=""
  }: {
    width?: number
    height?: number
    className?: string
  }) => {
    return (
        <Image
          src={pathLogo}
          alt="Loading..."
          width={300}
          height={300}
          priority={true}
          style={{ width, height }}
          className={className}
        />
    );
}