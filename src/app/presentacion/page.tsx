"use client"
import Link from "next/link";
import Image from 'next/image'
import {isMobile} from 'react-device-detect'
import BlueskyLogo from "@/components/icons/bluesky-logo";
import Footer from "../../../modules/ui-utils/src/footer";
import {Logo} from "../../../modules/ui-utils/src/logo";
import {Button, Color} from "../../../modules/ui-utils/src/button";
import {CheckIcon, ChecksIcon} from "@phosphor-icons/react";
import {useRouter, useSearchParams} from "next/navigation";
import {ReactNode, Suspense} from "react";


const TwoImages = ({url1, url2, alt1, alt2}: { url1: string, alt1: string, url2: string, alt2: string }) => {
    return <div className="flex justify-center items-center w-full">
        <Image
            src={url1}
            width={300}
            height={300}
            alt={alt1}
            className="rounded-2xl border border-[var(--text)] w-2/3 transform translate-x-[25%]"
        />
        <Image
            src={url2}
            width={300}
            height={300}
            alt={alt2}
            className="rounded-2xl border border-[var(--text)] w-2/3 transform translate-x-[-25%] translate-y-[25%]"
        />
    </div>
}


const FeatureSection = ({title, description, image, inverted, background = "background"}: {
    title: string, description: ReactNode, image: ReactNode, inverted: boolean, background?: Color
}) => {
    return <div style={{background: `var(--${background})`}} className={"w-full flex justify-center"}>
        <div className={"sm:hidden"}>
            <div className={"flex-col space-y-20 py-20 items-center justify-center flex"}>
                <div className={"w-screen px-8 flex justify-center items-center"}>
                    <div className={"space-y-4"}>
                        <h2 className={"font-extrabold sm:text-3xl text-2xl leading-none"}>
                            {title}
                        </h2>
                        <div className={"font-light text-lg max-[400px]:text-base"}>
                            {description}
                        </div>
                    </div>
                </div>
                {image && <div className={"w-screen px-6 flex justify-center items-center font-light text-xl"}>
                    {image}
                </div>}
            </div>
        </div>

        <div className={"sm:flex hidden"}>
            <div
                className={"w-screen max-w-[1200px] h-[600px] space-y-0 flex-row items-center " + (inverted ? "flex flex-row-reverse" : "flex")}>
                <div className={"w-1/2 h-full px-8 flex justify-center items-center flex-col"}>
                    <div className={"w-full max-w-[400px] space-y-2"}>
                        <h2 className={"font-extrabold md:text-3xl text-2xl leading-tight"}>
                            {image ? title : null}
                        </h2>
                        <div className={"font-light md:text-xl text-lg"}>
                            {description}
                        </div>
                    </div>
                </div>
                <div className={"w-1/2 h-full px-8 flex justify-center items-center font-light text-xl"}>
                    {image ? image :
                        <h2 className={"font-extrabold md:text-3xl text-2xl leading-tight"}>{title}</h2>}
                </div>
            </div>
        </div>
    </div>
}


const PresentacionFormato = () => {
    const itemIcon = <CheckIcon fontSize={36}/>

    const description = <ul className={"pt-4"}>
        <li className={"flex items-start gap-2"}>
            {itemIcon}
            <div className={"w-full"}>
                <span className={"font-bold"}>Publicaciones</span> con límite de caracteres.
            </div>
        </li>
        <li className="flex items-start gap-2">
            {itemIcon}
            <div className={"w-full"}>
                <span className={"font-bold"}>Artículos</span> sin límite de caracteres, con comentarios sobre el texto.
            </div>
        </li>
        <li className={"flex items-start gap-2"}>
            {itemIcon}
            <div className={"w-full"}>
                <span className={"font-bold"}>Visualizaciones</span> interactivas, con un
                editor que no requiere saber
                programar.
            </div>
        </li>
    </ul>

    const image = <div className={"flex space-x-2 max-w-[500px]"}>
        <div className={"flex flex-col space-y-2 h-full justify-center w-3/5"}>
            <Image
                src="/presentacion/light/rápida.png"
                width={2000}
                height={600}
                alt="Publicación rápida"
                className="rounded-tl-xl border border-[var(--text)] w-full h-auto"
            />
            <Image
                src="/presentacion/light/editor.png"
                width={700}
                height={700}
                alt="Publicación"
                className="rounded-bl-xl border border-[var(--text)] w-full h-auto mt-10"
            />
        </div>
        <div className={"flex flex-col space-y-2 justify-center w-2/5"}>
            <Image
                src="/presentacion/light/articulo.png"
                width={700}
                height={700}
                alt="Publicación"
                className="rounded-tr-2xl border border-[var(--text)] w-full h-auto"
            />
            <Image
                src="/presentacion/light/comentarios-texto.png"
                width={700}
                height={700}
                alt="Publicación"
                className="rounded-br-2xl border border-[var(--text)] w-full h-auto mt-10"
            />
        </div>
    </div>

    return <FeatureSection
        title={"Los formatos que conocés y mucho más."}
        description={description}
        image={image}
        inverted={true}
        background={"background-ldark"}
    />
}


const PresentacionWiki = () => {

    const description = <div className="mt-4">
        <p className={"mt-4"}>
            Cada tema tiene asociado un artículo con el consenso de la plataforma, que cualquiera puede editar.
        </p>
        <p className="mt-4">
            Los artículos tienen documentos oficiales, datos y explicaciones.
        </p>
    </div>

    const image = <TwoImages
        url1={"/presentacion/light/ley-bases.png"}
        url2={"/presentacion/light/inflacion.png"}
        alt1={"Ley bases"}
        alt2={"Inflación"}
    />

    return <FeatureSection
        title={"Una wiki para la discusión pública."}
        description={description}
        image={image}
        inverted={false}
    />
}


const PresentacionCalidadDeLaInformacion = () => {
    const itemIcon = <ChecksIcon className="mt-1" fontSize={36}/>
    const description = <ul className="space-y-4 px-2 max-w-[400px]">
        <li className="flex items-start gap-2">
            {itemIcon}
            <span className={"w-full"}>
                Selección de contenido transparente y configurable, para que ninguna IA elija lo que llega a tu pantalla.
            </span>
        </li>
        <li className="flex items-start gap-2">
            {itemIcon}
            <span className={"w-full"}>
                Sin publicidad.
            </span>
        </li>
        <li className="flex items-start gap-2">
            {itemIcon}
            <span className={"w-full"}>
                Con interlocutores de verdad. Validamos que todos los usuarios sean personas reales únicas.
            </span>
        </li>
    </ul>

    return <FeatureSection
        title={"Informate sin algoritmos ni bots."}
        description={description}
        image={null}
        inverted={true}
        background={"background-ldark"}
    />
}


const PresentacionRemuneraciones = () => {

    const description = <div className={"space-y-6 max-w-[400px]"}>
        <p className="">
            Cabildo Abierto se financia con aportes voluntarios de sus usuarios.
        </p>
        <p className="mt-6">
            Con eso, se remunera a cada autor de artículos individuales o temas de la wiki según su
            contribución y las lecturas que haya recibido.
        </p>
    </div>

    return <FeatureSection
        title={"Las contribuciones se valoran."}
        description={description}
        image={null}
        inverted={true}
    />
}


const PresentacionAbierto = () => {
    const description = <div className="space-y-2">
        <p>
            Cabildo Abierto usa <span className={""}>AT</span><span
            className={""}>Protocol</span>, un sistema de redes sociales
            descentralizadas que permite que nadie más que vos sea dueño de tus datos y facilita la libre competencia
            entre plataformas.
        </p>
        <p>
            Además, el código de Cabildo Abierto es público, para que cualquiera lo pueda revisar.
        </p>
    </div>

    const image = <div className={"rounded-lg p-2"}>
        <div className="relative border p-2 rounded-2xl border-[var(--text)] bg-[#fffff0]">
            <Image
                src="/presentacion/connected.png"
                width={400}
                height={300}
                alt="Red"
                className="w-full max-w-screen"
            />
            <div className="absolute z-2 left-3/4 -translate-x-1/2 top-1/2 -translate-y-1/2">
                <div className={"md:w-32 md:h-32 h-24 w-24"}>
                    <Logo width={400} height={400}/>
                </div>
            </div>
            <div className="absolute z-2 left-1/4 -translate-x-1/2 top-1/2 -translate-y-1/2">
                <Link href="https://bsky.social">
                    <BlueskyLogo className={"w-24 h-auto md:w-32"}/>
                </Link>
            </div>
            <div
                className="absolute z-2 left-1/2 bottom-1/4 translate-y-1/2 -translate-x-1/2 text-3xl pt-4">
                <Link href="https://atproto.com" className={"font-semibold tracking-tighter"}>
                    <span className="text-[#0481f7]">@AT</span><span className={"text-[#1a1a1a]"}>Protocol</span>
                </Link>
            </div>
        </div>
    </div>

    return <FeatureSection
        title={"Abierto en serio."}
        description={description}
        image={image}
        inverted={true}
        background={"background-ldark"}
    />
}


const PresentacionInicio = () => {
    const router = useRouter()
    const params = useSearchParams()
    const inviteCode = params.get("c")

    return <div className={"flex flex-col h-[600px] justify-center space-y-12"}>
        <div className="flex items-center flex-col">
            <div className="">
                <Logo width={80} height={80}/>
            </div>
            <div className="flex justify-center flex-col items-center mt-8">
                <h1 className="lg:text-[46px] sm:text-[38px] text-[26px] tracking-tight">
                    Cabildo Abierto
                </h1>
                <div
                    className="lg:text-[28px] sm:text-[22px] text-[16px] font-light tracking-tight  text-[var(--text-lighter)] text-center leading-tight"
                >
                    <div>Una plataforma para discutir de verdad,</div>
                    <div>hecha en Argentina.</div>
                </div>
            </div>
        </div>

        <div className="flex flex-col items-center">
            <Button
                color="background-dark2"
                size={!isMobile ? "large" : "medium"}
                sx={{
                    textTransform: "none",
                    borderRadius: 20,
                }}
                onClick={() => {
                    router.push("/login" + (inviteCode ? `?c=${inviteCode}` : ""))
                }}
            >
                <span className={"font-bold"}>Empezar</span>
            </Button>
        </div>
    </div>
}


export default function Page() {
    return <Suspense>
        <div className="flex flex-col items-center h-full presentation">
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