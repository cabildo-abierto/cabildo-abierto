import Image from "next/image";

export const Logo = ({
                         width = 64,
                         height = 64,
                         showLabel = false
                     }: {
    width?: number;
    height?: number;
    showLabel?: boolean
}) => {
    return (
        <div className={"flex items-center justify-center flex-col space-y-1"}>
        <Image
            src={"/logo.png"}
            width={width}
            height={height}
            alt={"Logo de Cabildo Abierto"}
        />
            {showLabel && <div style={{fontSize: width / 6}} className={"font-semibold article-content"}>
                Cabildo Abierto
            </div>}
        </div>
    );
};
