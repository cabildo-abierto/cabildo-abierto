import {ValidationState} from "@/lib/types";
import DescriptionOnHover from "../../../modules/ui-utils/src/description-on-hover";
import {topicUrl} from "@/utils/uri";
import { Color } from "../../../modules/ui-utils/src/button";
import Image from "next/image"


const ValidationIcon = ({handle, validation, fontSize = 22, width=12, height=12, iconColor="button-text", color="primary"}: {
    fontSize?: number, handle: string, width?: number, height?: number, validation: ValidationState, color?: Color, iconColor?: Color }) => {
    const moreInfoHref = topicUrl("Cabildo Abierto: Verificación de cuentas")

    if (validation == "person" || validation == "persona") {
        return <DescriptionOnHover description={handle && `@${handle} es una persona real argentina.`} moreInfoHref={moreInfoHref}>
            <Image alt="escarapela" style={{width, height}} src={"/escarapela.png"} width={400} height={400}/>
        </DescriptionOnHover>
    } else if (validation == "org") {
        return <DescriptionOnHover description={handle && `@${handle} es una organización verificada.`} moreInfoHref={moreInfoHref}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
            >
                {/* Outer circle */}
                <circle
                    cx={width / 2}
                    cy={height / 2}
                    r={Math.min(width, height) / 2}
                    fill="var(--primary)"
                />

                {/* Inner circle */}
                <circle
                    cx={width / 2}
                    cy={height / 2}
                    r={(Math.min(width, height) * 0.7) / 2}
                    fill="white"
                />

                {/* Centered image */}
                <image
                    href="/sol.png"
                    x={width / 2 - (width * 0.5) / 2}
                    y={height / 2 - (height * 0.5) / 2}
                    width={width * 0.5}
                    height={height * 0.5}
                    preserveAspectRatio="xMidYMid meet"
                />
            </svg>
        </DescriptionOnHover>
    }

    return null
}


export default ValidationIcon;