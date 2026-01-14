import {FeatureSection} from "@/components/presentacion/feature-section";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {useTheme} from "@/components/layout/theme/theme-context";
import {BaseButton} from "@/components/utils/base/base-button";
import {useSearchParams} from "next/navigation";
import {useLoginModal} from "@/components/auth/login-modal-provider";


export const LandingScroll = () => {
    const {currentTheme} = useTheme()
    const params = useSearchParams()
    const {setLoginModalOpen} = useLoginModal()

    const code = params.get("c")

    const cabildoWindow = <Image
        src={"/presentacion/construccion.png"}
        alt={"cabildo"}
        width={400} height={400}
        className={cn("opacity-80 w-[320px] h-auto", currentTheme == "dark" && "invert")}
    />

    const cabildoPlano = <Image
        src={"/presentacion/plano.png"}
        alt={"cabildo"}
        width={400} height={400}
        className={cn("opacity-80 w-[250px] h-auto", currentTheme == "dark" && "invert")}
    />

    const cabildoPuertas = <Image
        src={"/presentacion/puertas.png"}
        alt={"cabildo"}
        width={400} height={400}
        className={cn("opacity-80 w-[400px] h-auto", currentTheme == "dark" && "invert")}
    />

    const cabildo = <Image
        src={"/presentacion/cabildo.svg"}
        alt={"cabildo"}
        width={400} height={400}
        className={cn("opacity-80 w-[360px] h-auto", currentTheme == "dark" && "invert")}
    />

    return <div className={"bg-[var(--background-dark)] px-4 md:px-16 lg:px-32 tracking-[0.0167em]"}>
        <FeatureSection
            title={'Sin recomendaciones "para vos", sin publicidad y sin bots.'}
            subtitle={"Personas reales y algoritmos transparentes que no se basan en tus datos personales."}
            image={cabildoWindow}
            inverted={false}
        />

        <FeatureSection
            title={"Con herramientas para que las discusiones no queden en la superficie."}
            subtitle={"Una wiki (como Wikipedia) pero centrada en la discusión argentina."}
            image={cabildoPlano}
            inverted={true}
        />

        <FeatureSection
            title={"Con código y datos abiertos."}
            subtitle={"Cabildo Abierto es parte de ATProtocol, un nuevo ecosistema de plataformas descentralizadas, en el cual cada usuario es dueño de sus datos."}
            image={cabildoPuertas}
            inverted={false}
        />

        <FeatureSection
            title={"Hecha en Argentina e independiente de todo control corporativo o partidario."}
            subtitle={"Financiada por su comunidad, con donaciones que se redistribuyen a los autores."}
            image={cabildo}
            inverted={true}
        />

        <div className={"text-center space-y-6 portal group py-16"}>
            <div className={"tracking-tight font-light"}>
                Lanzamiento oficial: 25 de mayo de 2026.
            </div>
            <BaseButton
                variant={"default"}
                onClick={() => {
                    setLoginModalOpen(true, true, true)
                }}
                className={"rounded-xl bg-[var(--text)] text-[var(--background)] hover:bg-[var(--text-light)]"}
            >
                <div>
                    {!code && <div className={"text-xs  normal-case"}>
                        ¡Sumate a probar la plataforma!
                    </div>}
                    {code && <div className={"text-xs  normal-case"}>
                        ¡Recibiste un código de invitación!
                    </div>}
                    Participar en el acceso anticipado
                </div>
            </BaseButton>
        </div>
    </div>
}