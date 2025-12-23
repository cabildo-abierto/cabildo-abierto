import {FeatureSection} from "@/components/presentacion/feature-section";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {useTheme} from "@/components/layout/theme/theme-context";
import Link from "next/link";
import {topicUrl} from "@/components/utils/react/url";
import {ArrowSquareOutIcon} from "@phosphor-icons/react";


const LandingBadge = ({text, href}: {text: string, href: string}) => {
    return <Link href={href} className={"bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)] text-[var(--text)] space-x-1 flex items-center text-xs px-2 py-0.5 font-light tracking-tight"}>
        <div>
            {text}
        </div>
        <ArrowSquareOutIcon/>
    </Link>
}


export const LandingScroll = () => {
    const {currentTheme} = useTheme()

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
            description={<div className={"space-y-2 max-w-[400px] flex flex-col justify-between"}>
                <div className={"leading-tight tracking-tight text-2xl"}>
                    Sin recomendaciones {'"'}para vos{'"'}, sin publicidad y sin bots.
                </div>
                <div className={"font-semibold text-[var(--text-light)] text-base md:text-base"}>
                    Personas reales y algoritmos transparentes que no se basan en tus datos personales.
                </div>
                <div className={"flex flex-wrap gap-x-2 gap-y-1"}>
                    <LandingBadge text={"Muros"} href={topicUrl("Cabildo Abierto: Muros")}/>
                    <LandingBadge text={"Verificación"} href={topicUrl("Cabildo Abierto: Verificación de cuentas")}/>
                </div>
            </div>}
            image={cabildoWindow}
            inverted={false}
        />

        <FeatureSection
            title={""}
            description={<div className={"space-y-2 max-w-[400px]"}>
                <div className={"leading-tight tracking-tight text-2xl"}>
                    Con herramientas para que las discusiones no queden en la superficie y para que tener consensos
                    básicos sea posible.
                </div>
                <div className={"text-[var(--text-light)] font-semibold text-base md:text-base"}>
                    Una wiki (como Wikipedia) pero centrada en la discusión argentina.
                </div>
                <div className={"flex flex-wrap gap-x-2 gap-y-1"}>
                    <LandingBadge text={"Wiki"} href={topicUrl("Cabildo Abierto: Wiki")}/>
                    <LandingBadge text={"Visualizaciones"} href={topicUrl("Cabildo Abierto: Visualizaciones")}/>
                </div>
            </div>}
            image={cabildoWindow}
            inverted={true}
        />

        <FeatureSection
            title={""}
            description={<div className={"space-y-2 max-w-[400px]"}>
                <div className={"tracking-tight leading-tight text-2xl"}>
                    Hecha en Argentina e independiente de todo control corporativo o partidario.
                </div>
                <div
                    className={"text-[var(--text-light)] font-semibold text-base md:text-base"}
                >
                    Financiada por su comunidad, con donaciones que se redistribuyen a los autores.
                </div>
                <div className={"flex flex-wrap gap-x-2 gap-y-1"}>
                    <LandingBadge
                        text={"Financiamiento"}
                        href={topicUrl("Cabildo Abierto: Financiamiento")}
                    />
                    <LandingBadge
                        text={"Remuneraciones"}
                        href={topicUrl("Cabildo Abierto: Remuneraciones")}
                    />
                    <LandingBadge
                        text={"Equipo"}
                        href={"/equipo"}
                    />
                </div>
            </div>}
            image={cabildo}
            inverted={false}
        />

        <FeatureSection
            title={""}
            description={<div className={"space-y-2 max-w-[400px]"}>
                <div className={"tracking-tight leading-tight text-2xl"}>
                    Con código y datos abiertos.
                </div>
                <div
                    className={"text-[var(--text-light)] font-semibold text-sm md:text-base"}
                >
                    Cabildo Abierto es parte de ATProtocol, un nuevo ecosistema de plataformas descentralizadas, en el cual convive con Bluesky.
                </div>
                <div className={"flex flex-wrap gap-x-2 gap-y-1"}>
                    <LandingBadge text={"Nuestro GitHub"} href={"https://github.com/cabildo-abierto/cabildo-abierto"}/>
                    <LandingBadge text={"Relación con Bluesky"} href={topicUrl("Cabildo Abierto: Relación con Bluesky y descentralización")}/>
                </div>
            </div>}
            image={cabildoWindow}
            inverted={true}
        />
    </div>
}