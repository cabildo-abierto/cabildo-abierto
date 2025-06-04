import Image from 'next/image'

const BlueskyLogo = ({className}: {className?: string}) => {
    return <Image
        src={"/Bluesky_Logo.svg"}
        alt={"Bluesky"}
        width={300}
        height={300}
        className={className}
    />
}


export default BlueskyLogo;