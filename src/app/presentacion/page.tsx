"use client"
import Link from "next/link";
import Image from 'next/image'
import {isMobile} from 'react-device-detect'
import BlueskyLogo from "@/components/icons/bluesky-logo";
import Footer from "../../../modules/ui-utils/src/footer";
import {Logo} from "../../../modules/ui-utils/src/logo";
import {Button} from "../../../modules/ui-utils/src/button";
import {ArrowDownIcon, AsteriskIcon} from "@phosphor-icons/react";
import {useRouter, useSearchParams} from "next/navigation";
import {Suspense} from "react";


const LogoAndSlogan = () => {
    return <div className="flex items-center flex-col">
        <div className="">
            <Logo width={80} height={80}/>
        </div>
        <div className="flex justify-center flex-col items-center mt-8">
            <h1 className="lg:text-4xl text-4xl">Cabildo Abierto</h1>
            <div
                className="text-base text-[var(--text-light)] text-center lg:text-[1.29rem] text-[1.05rem] my-0 py-0 mt-2">
                Todo está abierto a discusión.
            </div>
        </div>
    </div>
}


const TwoImages = ({url1, url2, alt1, alt2}: { url1: string, alt1: string, url2: string, alt2: string }) => {
    return <div className="relative">
        <div className="absolute left-0 top-[-140px] w-3/4">
            <Image
                src={url1}
                width={300}
                height={300}
                alt={alt1}
                className="rounded-lg shadow-2xl w-full h-auto"
            />
        </div>
        <div className="absolute z-2 left-1/4 w-3/4 top-[-40px]">
            <Image
                src={url2}
                width={300}
                height={300}
                alt={alt2}
                className="rounded-lg shadow-2xl w-full h-auto"
            />
        </div>
    </div>
}


const PresentacionWiki = () => {
    return <div
        className="w-full flex flex-col md:flex-row items-center justify-center md:space-x-16 mt-32 md:mt-32 px-4 space-y-48 md:space-y-0"
    >
        <div className="md:w-1/2 w-screen h-full text-center md:px-0 px-4 max-w-[400px] flex flex-col justify-center">
            <h2 className={"md:text-3xl text-xl"}>
                Una wiki para la discusión pública argentina.
            </h2>
            <div className="md:text-xl text-lg mt-4">
                <p className={"mt-4"}>
                    De cada tema se reúne el consenso informativo y la discusión en un mismo lugar.
                </p>
                <p className="mt-4">
                    Los artículos tienen documentos oficiales, datos y explicaciones.
                </p>
                <p className="mt-4">Cualquiera puede contribuir creando temas de discusión o mejorando temas
                    que ya existan.
                </p>
            </div>
        </div>
        <div className={"md:w-1/2 px-4 w-screen max-w-[400px] flex flex-col justify-center h-full"}>
            <TwoImages
                url1={"/presentacion/light/ley-bases.png"}
                url2={"/presentacion/light/inflacion.png"}
                alt1={"Ley bases"}
                alt2={"Inflación"}
            />
        </div>
    </div>
}


const PresentacionFormato = () => {
    return <div className={"flex max-w-[90%] items-center mt-16 md:space-x-16 md:flex-row flex-col space-y-16 px-4 md:px-0"}>
        <div className={"md:w-1/2 flex space-x-2 max-w-[500px]"}>
            <div className={"flex flex-col space-y-2 h-full justify-center w-3/5"}>
                <Image
                    src="/presentacion/light/rápida.png"
                    width={2000}
                    height={600}
                    alt="Publicación rápida"
                    className="rounded shadow-2xl w-full h-auto mt-10"
                />
                <Image
                    src="/presentacion/light/editor.png"
                    width={700}
                    height={700}
                    alt="Publicación"
                    className="rounded-lg shadow-2xl w-full h-auto mt-10"
                />
            </div>
            <div className={"flex flex-col space-y-2 justify-center w-2/5"}>
                <Image
                    src="/presentacion/light/articulo.png"
                    width={700}
                    height={700}
                    alt="Publicación"
                    className="rounded-lg shadow-2xl w-full h-auto mt-10"
                />
                <Image
                    src="/presentacion/light/comentarios-texto.png"
                    width={700}
                    height={700}
                    alt="Publicación"
                    className="rounded-lg shadow-2xl w-full h-auto mt-10"
                />
            </div>
        </div>
        <div className={"md:w-1/2 space-y-4 md:max-w-[400px]"}>
            <h2 className={"xl:text-2xl lg:text-xl text-lg"}>
                La discusión con límite de caracteres que conocés, combinada con otros formatos para quienes quieran
                profundizar un poco más.
            </h2>
            <div className={"space-y-4 xl:text-xl lg:text-lg text-base"}>
                <ul>
                    <li className="flex items-start gap-2">
                        <AsteriskIcon className="mt-1"/>
                        <div className={"w-full"}>
                            Artículos sin límite de caracteres con comentarios sobre el texto.
                        </div>
                    </li>
                    <li className="flex items-start gap-2">
                        <AsteriskIcon className="mt-1"/>
                        <div className={"w-full"}>
                            Gráficos interactivos, completamente transparentes, con un editor que no requiere programar.
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
}


const PresentacionCalidadDeLaInformacion = () => {
    return <div
        className="lg:max-w-[80%] w-full flex items-center justify-center md:flex-row flex-col md:mt-48 mt-72 space-y-12 px-4 md:px-0 md:space-y-0 md:space-x-16"
    >
        <div className={"md:w-1/2 sm:text-left flex justify-center md:max-w-[400px]"}>
            <h2 className={"max-w-[250px] text-2xl md:text-3xl"}>Informate, sin algoritmos ni bots.</h2>
        </div>
        <div className={"md:w-1/2 max-w-[400px] lg:text-xl text-lg"}>
            <ul className="space-y-4 px-2">
                <li className="flex items-start gap-2">
                    <AsteriskIcon className="mt-1"/>
                    <span className={"w-full"}>
                        Te ofrecemos algoritmos transparentes y configurables, para que ninguna IA elija lo que llega a tu pantalla.
                    </span>
                </li>
                <li className="flex items-start gap-2">
                    <AsteriskIcon className="mt-1"/>
                    <span className={"w-full"}>
                        Tampoco hay publicidad.
                    </span>
                </li>
                <li className="flex items-start gap-2">
                    <AsteriskIcon className="mt-1"/>
                    <span className={"w-full"}>
                        Además, validamos que los usuarios sean personas reales únicas.
                    </span>
                </li>
            </ul>
        </div>
    </div>
}


const PresentacionRemuneraciones = () => {
    return <div className="md:max-w-[70%] flex flex-col-reverse items-center md:flex-row md:space-x-16 mb-32 sm:mt-32 mt-24 px-4 md:px-0">
        <div className="md:w-1/2 mt-8 md:mt-0">
            <Image
                src="/presentacion/remuneraciones.svg"
                alt="Remuneraciones a autores"
                width={700}
                height={500}
                className="w-[400px] h-auto shadow-xl rounded-lg p-4"
            />
        </div>
        <div className="md:w-1/2 max-w-[400px] w-full flex flex-col items-center text-center px-2 md:px-0">
            <h2>Reconocimiento a los autores.</h2>
            <p className="mt-8 text-lg">
                Cabildo Abierto se financia con aportes voluntarios.
            </p>
            <p className="mt-6 text-lg">
                Con eso, se remunera a cada autor de artículos individuales o temas de la wiki según su
                contribución y las lecturas que haya recibido.
            </p>
        </div>
    </div>
}


const PresentacionAbierto = () => {
    return <div className="md:mt-12 mb-32 flex w-screen md:max-w-[90%] justify-center md:flex-row flex-col items-center md:space-x-12">
        <div className={"flex text-lg md:text-xl flex-col items-center text-center max-w-[400px] md:max-w-1/2 md:w-full w-screen px-8 md:px-0"}>
            <h2>
                Abierto en serio.
            </h2>
            <div className="md:text-lg mt-4 space-y-6">
                <p>
                    Cabildo Abierto se basa en <span>AT</span><span>Protocol</span>, un sistema de redes sociales
                    descentralizadas que permite que nadie más que vos sea dueño de tus datos. Tu cuenta de
                    Cabildo Abierto y la de Bluesky son la misma y tu perfil, seguidores y contenidos se comparten.
                </p>
                <p>
                    Además, el código de Cabildo Abierto es público para que cualquiera lo pueda revisar.
                </p>
            </div>
        </div>
        <div className="flex justify-center items-center md:max-w-[400px] md:max-w-1/2 md:w-full w-screen px-4">
            <div className={"shadow-2xl rounded-lg p-2"}>
                <div className="relative">
                    <Image
                        src="/presentacion/connected.png"
                        width={400}
                        height={300}
                        alt="Red"
                        className="w-full max-w-screen"
                    />
                    <div className="absolute z-2 left-3/4 -translate-x-1/2 top-1/2 -translate-y-1/2">
                        <div className={"md:w-32 md:h-32 h-24 w-24"}>
                            <Image
                                src="/logo.png"
                                width={400}
                                height={400}
                                alt="Logo de Cabildo Abierto"
                                className="rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                    <div className="absolute z-2 left-1/4 -translate-x-1/2 top-1/2 -translate-y-1/2">
                        <Link href="https://bsky.social">
                            <BlueskyLogo className={"w-24 h-auto md:w-32"}/>
                        </Link>
                    </div>
                    <div className="absolute z-2 left-1/2 bottom-1/4 translate-y-1/2 -translate-x-1/2 text-3xl pt-4">
                        <Link href="https://atproto.com">
                            <span className="text-[#0481f7]">@AT</span><span>Protocol</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
}


const PresentacionInicio = () => {
    const router = useRouter()
    const params = useSearchParams()
    const inviteCode = params.get("c")

    return <div className={"flex flex-col pt-24 pb-6 space-y-16 h-screen"}>
        <LogoAndSlogan/>

        <div className="flex flex-col items-center">
            <Button
                color="primary"
                size={!isMobile ? "large" : "medium"}
                sx={{
                    textTransform: "none",
                    borderRadius: 20,
                }}
                onClick={() => {
                    router.push("/login" + (inviteCode ? `?c=${inviteCode}` : ""))
                }}
            >
                <span className={"text-[15px] font-semibold"}>Crear cuenta o iniciar sesión</span>
            </Button>
        </div>

        <div className={"md:text-xl text-center max-w-[420px] font-semibold"}>
            Cabildo Abierto es un foro argentino que combina una wiki y artículos sin límite de caracteres con una
            discusión al mejor estilo de Twitter o Bluesky.
        </div>

        <div className={"text-base items-center space-x-4 flex justify-center"}>
            <div>Más información</div>
            <ArrowDownIcon/>
        </div>
    </div>
}


export default function Page() {
    return <Suspense>
        <div className="flex flex-col items-center px-2 h-full">
            <PresentacionInicio/>
            <PresentacionFormato/>
            <PresentacionWiki/>
            <PresentacionCalidadDeLaInformacion/>
            <PresentacionRemuneraciones/>
            <PresentacionAbierto/>
        </div>
        <Footer showCA={false}/>
    </Suspense>
}