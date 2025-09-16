import Image from "next/image";

export const Logo = ({
    width = 64,
    height = 64,
    showLabel = true
}: {
    width?: number
    height?: number
    showLabel?: boolean
}) => {
    return (
        <div>
            <Image
                src={showLabel ? "/logo.svg" : "/logo.svg"}
                width={width}
                height={height}
                alt={"Logo de Cabildo Abierto"}
                style={{width, height}}
                className={"object-contain"}
            />
        </div>
    );
};
