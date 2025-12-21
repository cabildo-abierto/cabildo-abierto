import {FeatureSection} from "@/components/presentacion/feature-section";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {useTheme} from "@/components/layout/theme/theme-context";


export const LandingScroll = () => {
    const {currentTheme} = useTheme()

    const pastelito = <Image
        src={"/pastelito.svg"}
        alt={"pastelito"}
        width={300}
        height={300}
        className={cn("opacity-80 w-[360px] h-auto", currentTheme == "dark" && "invert")}
    />

    const cabildoWindow = <Image
        src={"/presentacion/construccion.png"}
        alt={"cabildo"}
        width={400} height={400}
        className={cn("opacity-80 w-[320px] h-auto", currentTheme == "dark" && "invert")}
    />

    const cabildo = <Image
        src={"/presentacion/cabildo.svg"}
        alt={"cabildo"}
        width={400} height={400}
        className={cn("opacity-80 w-[360px] h-auto", currentTheme == "dark" && "invert")}
    />

    return <div className={"bg-[var(--background-dark)] px-4 md:px-16 lg:px-32 tracking-[0.0167em]"}>
        <FeatureSection
            title={""}
            description={<div className={"space-y-2 max-w-[400px]"}>
                <div className={"leading-tight tracking-tight"}>
                    Sin recomendaciones {'"'}para vos{'"'}, sin publicidad y sin bots.
                </div>
                <div className={"font-semibold text-[var(--text-light)] text-sm md:text-base"}>
                    Personas reales y algoritmos transparentes que no se basan en tus datos personales.
                </div>
            </div>}
            image={cabildoWindow}
            inverted={false}
        />

        <FeatureSection
            title={""}
            description={<div className={"space-y-2 max-w-[400px]"}>
                <div className={"leading-tight tracking-tight"}>
                    Con herramientas para que las discusiones no queden en la superficie y para que tener consensos
                    básicos sea posible.
                </div>
                <div className={"text-[var(--text-light)] font-semibold text-sm md:text-base"}>
                    Una wiki (como Wikipedia) pero centrada en la discusión argentina.
                </div>
            </div>}
            image={pastelito}
            inverted={true}
        />

        <FeatureSection
            title={""}
            description={<div className={"space-y-2 max-w-[400px]"}>
                <div className={"tracking-tight leading-tight"}>
                    Hecha en Argentina e independiente de todo control corporativo o partidario.
                </div>
                <div className={"text-[var(--text-light)] font-semibold text-sm md:text-base"}>
                    Con código y datos abiertos y financiada por su comunidad.
                </div>
            </div>}
            image={cabildo}
            inverted={false}
        />

    </div>
}