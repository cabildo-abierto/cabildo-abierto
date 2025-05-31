import Image from "next/image";
import {useTheme} from "@/components/theme/theme-context";

export const Logo = ({
                         width = 64,
                         height = 64
                     }: {
    width?: number;
    height?: number;
}) => {
    const theme = useTheme()
    const dark = theme.currentTheme == "dark"
    return (
        <Image
            src={"/CA.svg"}
            width={width}
            height={height}
            alt={"Logo de Cabildo Abierto"}
            className={dark ? "invert" : ""}
        />
    );
};
