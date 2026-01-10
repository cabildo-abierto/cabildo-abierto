import Image from 'next/image'

const BlueskyLogo = ({className}: {className?: string}) => {
    return <Image
        src={"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Bluesky_Logo.svg/900px-Bluesky_Logo.svg.png"}
        alt={"Bluesky"}
        width={300}
        height={300}
        className={className}
    />
}


export default BlueskyLogo;