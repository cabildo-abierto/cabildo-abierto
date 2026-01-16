import {FeatureSection} from "@/components/presentacion/feature-section";
import Image from "next/image";
import {cn} from "@/lib/utils";
import {useTheme} from "@/components/layout/theme/theme-context";
import {BaseButton} from "@/components/utils/base/base-button";
import {useRouter, useSearchParams} from "next/navigation";
import {useLoginModal} from "@/components/auth/login-modal-provider";
import {useSession} from "@/components/auth/use-session";
import {Logo} from "@/components/utils/icons/logo";
import Link from "next/link";
import BlueskyLogo from "@/components/utils/icons/bluesky-logo";


export const LandingScroll = () => {
    const {currentTheme} = useTheme()
    const params = useSearchParams()
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()
    const router = useRouter()

    const code = params.get("c")

    const topics = <Image
        src={`/presentacion/${currentTheme}/temas.png`}
        alt={"temas"}
        width={400} height={400}
        className={cn("w-[320px] h-auto")}
    />

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

    const atproto = <div className="relative p-2">
        <Image
            src="/presentacion/connected.png"
            width={400}
            height={300}
            alt="Red"
            className="w-full max-w-screen opacity-80"
        />
        <div className="absolute z-2 left-3/4 -translate-x-1/2 -translate-y-1/2 top-1/2 w-24 md:w-32 h-24 md:h-32">
            <Logo className={"w-full h-full object-contain"}/>
        </div>
        <div className="absolute z-2 left-1/4 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <Link href="https://bsky.social">
                <BlueskyLogo className={"w-24 h-auto md:w-32"}/>
            </Link>
        </div>
        <div
            className="absolute z-2 left-1/2 bottom-8 translate-y-1/2 -translate-x-1/2 text-3xl pt-4">
            <Link href="https://atproto.com" className={"font-bold tracking-tighter"}>
                <span className="text-[#0481f7]">@AT</span><span className={"text-[var(--accent-dark)]"}>Protocol</span>
            </Link>
        </div>
    </div>

    return <div className={"bg-[var(--background)] px-4 md:px-16 lg:px-32 tracking-[0.0167em]"}>
        <FeatureSection
            title={'Porque información y discusión van mejor juntos.'}
            subtitle={<div className={"space-y-4"}>
                La discusión que conocés, combinada con artículos, visualizaciones y una wiki (como Wikipedia) pero centrada en la discusión argentina.
            </div>}
            image={topics}
            inverted={true}
        />

        <FeatureSection
            title={"Para que nadie más que vos controle lo que llega a tu pantalla."}
            subtitle={"Personas reales y algoritmos transparentes que no se basan en tus datos personales. Sin publicidad, ni ahora ni nunca."}
            image={cabildoWindow}
            inverted={false}
        />

        <FeatureSection
            title={"Porque tenés derecho a saber cómo funciona, y tus datos son tuyos."}
            subtitle={<div className={"space-y-4"}>
                <p>
                    Cabildo Abierto es de código abierto, cualquiera lo puede revisar (<Link className={"underline"} href={"https://github.com/cabildo-abierto/cabildo-abierto"}>acá</Link>).
                </p>
                <p>
                    Además, es parte de un nuevo ecosistema de plataformas descentralizadas que permite que
                    cada usuario sea dueño de sus datos y hace que migrar entre plataformas sea mucho más fácil.
                </p>
            </div>}
            image={atproto}
            inverted={true}
        />

        <FeatureSection
            title={"Porque la soberanía importa."}
            subtitle={"Cabildo Abierto está hecha en Argentina y es independiente de todo control corporativo o partidario. Es financiada por su comunidad, con donaciones que se redistribuyen a los autores."}
            image={cabildo}
            inverted={false}
        />

        <div className={"text-center space-y-6 portal group py-16"}>
            <div className={"tracking-tight font-light"}>
                Lanzamiento oficial: 25 de mayo de 2026.
            </div>
            <BaseButton
                onClick={() => {
                    if (user) {
                        router.push("/inicio")
                    } else {
                        setLoginModalOpen(true, true, true)
                    }
                }}
                variant={"black"}
                className={"rounded-xl text-[var(--background)]"}
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