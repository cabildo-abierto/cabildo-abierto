import Image from "next/image";

export const Logo = ({
    width,
    height,
    showLabel = true,
    className = "object-contain"
}: {
    width?: number
    height?: number
    showLabel?: boolean
    className?: string
}) => {
    return (
        <div>
            <Image
                src={showLabel ? "/logo.svg" : "/logo.svg"}
                width={400}
                height={400}
                style={{width, height}}
                alt={"Logo de Cabildo Abierto"}
                className={className}
            />
        </div>
    );
};
