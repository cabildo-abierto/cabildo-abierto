"use client"
import Link from "next/link";
import Image from 'next/image'
import {isMobile} from 'react-device-detect'
import BlueskyLogo from "@/components/icons/bluesky-logo";
import Footer from "../../../modules/ui-utils/src/footer";
import {Logo} from "../../../modules/ui-utils/src/logo";
import {Button} from "../../../modules/ui-utils/src/button";
import {AsteriskIcon} from "@phosphor-icons/react";


const LogoAndSlogan = () => {
    return <div className="flex items-center flex-col">
        <div className="">
            <Logo width={80} height={80}/>
        </div>
        <div className="flex justify-center flex-col items-center mt-8">
            <h1 className="lg:text-4xl text-4xl">Cabildo Abierto</h1>
            <div
                className="text-base text-[var(--text-light)] text-center lg:text-[1.29rem] text-[1.05rem] my-0 py-0 mt-2">
                Sumate a discutir lo público.
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
                className="rounded-lg shadow-lg w-full h-auto"
            />
        </div>
        <div className="absolute z-2 left-1/4 w-3/4 top-[-40px]">
            <Image
                src={url2}
                width={300}
                height={300}
                alt={alt2}
                className="rounded-lg shadow-lg w-full h-auto"
            />
        </div>
    </div>
}


const PresentacionWiki = () => {
    return <div
        className="w-full flex flex-col md:flex-row items-center justify-center md:space-x-12 mt-64 md:mt-32"
    >
        <div className={"md:w-1/2 px-4 w-screen max-w-[400px]"}>
            <TwoImages url1={"/presentacion/light/ley-bases.png"} url2={"/presentacion/light/inflacion.png"}
                       alt1={"Ley bases"} alt2={"Inflación"}/>
        </div>
        <div className="md:w-1/2 w-screen h-full text-center md:px-0 px-4 mt-64 md:mt-0 max-w-[400px]">
            <h2 className={"text-lg md:text-2xl"}>Una wiki para la discusión pública argentina.</h2>
            <div className="text-lg mt-4">
                <p className="mt-4">
                    Reunimos documentos oficiales, datos y explicaciones.
                </p>
                <p className="mt-4">Cualquiera puede contribuir creando temas de discusión o mejorando temas
                    que ya existan.
                </p>
            </div>
        </div>
    </div>
}


const PresentacionFormato = () => {
    return <div className="flex flex-col items-center md:space-x-0 space-x-6 md:mt-64 mt-32">
        <h2 className="text-center">Todo está abierto a discusión.</h2>
        <div className={"max-w-[400px] text-center mt-2"}>
            Discusión al mejor estilo de Twitter o Bluesky, pero con algunos adicionales
            para facilitar discusiones elaboradas.
        </div>
        <div className="mt-16 flex flex-col md:flex-row justify-center space-y-16 md:space-y-0">
            <div className="flex flex-col items-center flex-1 md:px-4 text-center">
                <h4>Hacé publicaciones rápidas.</h4>
                <Image
                    src="/presentacion/light/rápida.png"
                    width={700}
                    height={300}
                    alt="Publicación rápida"
                    className="rounded shadow-xl w-[280px] h-auto mt-10"
                />
            </div>
            <div className="flex flex-col items-center text-center flex-1 md:px-4">
                <h4>Comentá sobre el texto.</h4>
                <Image
                    src="/presentacion/light/comentarios-texto.png"
                    width={700}
                    height={300}
                    alt="Comentarios"
                    className="rounded-lg shadow-xl w-[300px] h-auto mt-10"
                />
            </div>
            <div className="flex flex-col items-center flex-1 md:px-4 text-center">
                <h4>Escribí artículos sin límite de caracteres.</h4>
                <Image
                    src="/presentacion/light/articulo.png"
                    width={700}
                    height={700}
                    alt="Publicación"
                    className="rounded-lg shadow-xl w-[200px] h-auto mt-10"
                />
            </div>
        </div>
    </div>
}


const PresentacionCalidadDeLaInformacion = () => {
    return <div className="flex justify-cente md:flex-row flex-col py-32 space-y-12 md:space-y-0 md:space-x-16">
        <div className={"text-center sm:text-left max-w-[400px] w-full flex justify-center"}>
            <h2 className={"max-w-[200px]"}>Informate sin algoritmos ni bots.</h2>
        </div>
        <div className={"max-w-[400px] w-full"}>
            <ul className="space-y-4 text-lg px-2">
                <li className="flex items-start gap-2">
                    <AsteriskIcon className="mt-1"/>
                    <span className={"w-full"}>
                        Los algoritmos en Cabildo Abierto son transparentes y configurables, ninguna IA va a elegir lo que llega a tu pantalla.
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
                        Además, validamos que todos los usuarios sean personas reales únicas.
                    </span>
                </li>
            </ul>
        </div>
    </div>
}


const PresentacionGraficos = () => {
    return <div
        className="w-full flex flex-col-reverse md:flex-row items-center justify-center md:space-x-12 md:mt-0 mb-64 md:mb-0"
    >
        <div className={"mt-48 md:w-1/2 px-4 w-screen max-w-[400px]"}>
            <TwoImages
                url2={"/presentacion/light/editor.png"}
                url1={"/presentacion/light/dataset.png"}
                alt2={"Editor de visualizaciones"}
                alt1={"Conjuntos de datos"}
            />
        </div>
        <div className="md:max-w-[400px] h-full text-center md:px-0 px-4 md:mt-0">
            <h2 className="">¡Gráficos!</h2>
            <div className="text-lg mt-4">
                <p className="mt-4">
                    En cualquier contenido se pueden incluir gráficos interactivos basados en datos
                    públicos, con total transparencia sobre cómo fueron generados.
                </p>
                <p className="mt-4">
                    Creamos una interfaz para que cualquiera pueda crear estos gráficos, sin necesidad de programar.
                </p>
            </div>
        </div>
    </div>
}


const PresentacionRemuneraciones = () => {
    return <div className="flex flex-col-reverse items-center md:flex-row md:space-x-16 mb-32 sm:mt-64">
        <div className="mt-8 md:mt-0">
            <Image
                src="/presentacion/remuneraciones.svg"
                alt="Remuneraciones a autores"
                width={700}
                height={500}
                className="w-[450px] h-auto"
            />
        </div>
        <div className="max-w-[350px] w-full flex flex-col items-center text-center px-2 md:px-0">
            <h2>Remuneración a los autores.</h2>
            <p className="mt-8 text-lg">
                Cabildo Abierto se financia con aportes voluntarios.
            </p>
            <p className="mt-6 text-lg">
                Con eso, se remunera a cada autor de artículos individuales o temas de la wiki según su
                contribución y la cantidad de lecturas que haya tenido.
            </p>
        </div>
    </div>
}


const PresentacionAbierto = () => {
    return <div className="mt-12 mb-32 flex w-screen justify-center md:flex-row flex-col-reverse">
        <div className="flex justify-center md:w-1/2 w-screen px-4">
            <div>
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
                    <div className="absolute z-2 left-1/2 bottom-1/4 translate-y-1/2 -translate-x-1/2 text-2xl">
                        <Link href="https://atproto.com">
                            <span className="text-[#0481f7]">@AT</span><span>Protocol</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
        <div className={"flex flex-col items-center text-center md:w-1/2 md:max-w-[400px] w-screen px-4 md:px-0"}>
            <h2>
                Abierto en serio
            </h2>
            <div className="md:text-lg mt-4 space-y-6">
                <p>
                    Cabildo Abierto se basa en <span>AT</span><span>Protocol</span>, el mismo
                    sistema que usa Bluesky, que permite que nadie más que vos sea dueño de tus datos. Tu cuenta de
                    Cabildo Abierto y la de Bluesky son la misma y tu perfil, seguidores y contenidos se comparten.
                </p>
                <p>
                    Además de esto, el código de Cabildo Abierto es público para que cualquiera lo pueda revisar.
                </p>
            </div>
        </div>
    </div>
}


const PresentacionInicio = () => {
    return <div className={"flex flex-col pt-24 pb-6 space-y-16"}>
        <LogoAndSlogan/>

        <div className="flex flex-col items-center">
            <Link href="/login">
                <Button
                    color="primary"
                    size={!isMobile ? "large" : "medium"}
                    sx={{
                        textTransform: "none",
                        borderRadius: 20,
                    }}
                >
                    <span className={"text-[15px] font-semibold"}>Crear cuenta o iniciar sesión</span>
                </Button>
            </Link>
        </div>

        <div className={"md:text-lg text-center max-w-[400px] font-semibold"}>
            Cabildo Abierto es un foro en el que, además de discutir, reunimos toda la información relevante en
            una wiki a la que cualquiera puede contribuir.
        </div>
    </div>
}


export default function Page() {
    return <div>
        <div className="flex px-1 flex-col justify-between">
            <div className="flex flex-col items-center px-1 h-full">
                <PresentacionInicio/>
                <PresentacionWiki/>
                <PresentacionFormato/>
                <PresentacionCalidadDeLaInformacion/>
                <PresentacionGraficos/>
                <PresentacionRemuneraciones/>
                <PresentacionAbierto/>
            </div>
        </div>
        <Footer showCA={false}/>
    </div>
}