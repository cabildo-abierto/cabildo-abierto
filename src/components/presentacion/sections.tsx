import {GoToLoginButton} from "@/components/presentacion/go-to-login-button";
import Link from "next/link";
import Image from 'next/image'
import BlueskyLogo from "@/components/layout/icons/bluesky-logo";
import {Logo} from "../../../modules/ui-utils/src/logo";
import {ArrowDownIcon, CheckIcon, ChecksIcon} from "@phosphor-icons/react";
import {FeatureSection} from "@/components/presentacion/feature-section";
import {TwoImages} from "@/components/presentacion/two-images";


export const PresentacionFormato = () => {
    const itemIcon = <CheckIcon fontSize={36}/>

    const description = <div>
        <ul className={"pt-4"}>

            <li className={"flex items-start gap-2"}>
                {itemIcon}
                <div className={"w-full"}>
                    <span className={"font-bold"}>Publicaciones</span> con límite de caracteres, como las de Twitter o
                    Bluesky.
                </div>
            </li>
            <li className="flex items-start gap-2">
                {itemIcon}
                <div className={"w-full"}>
                    <span className={"font-bold"}>Artículos</span> sin límite de caracteres, con comentarios sobre el
                    texto.
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
    </div>

    const image = <div className={"flex space-x-2 max-w-[500px]"}>
        <div className={"flex flex-col space-y-2 h-full justify-center w-3/5"}>
            <Image
                src="/presentacion/light/rápida.png"
                width={2000}
                height={600}
                alt="Publicación rápida"
                className="border border-[var(--text)] w-full h-auto"
            />
            <Image
                src="/presentacion/light/editor.png"
                width={700}
                height={700}
                alt="Publicación"
                className="border border-[var(--text)] w-full h-auto mt-10"
            />
        </div>
        <div className={"flex flex-col space-y-2 justify-center w-2/5"}>
            <Image
                src="/presentacion/light/articulo.png"
                width={700}
                height={700}
                alt="Publicación"
                className="border border-[var(--text)] w-full h-auto"
            />
            <Image
                src="/presentacion/light/comentarios-texto.png"
                width={700}
                height={700}
                alt="Publicación"
                className="border border-[var(--text)] w-full h-auto mt-10"
            />
        </div>
    </div>

    return <FeatureSection
        title={"Porque a veces 280 caracteres se quedan cortos."}
        description={description}
        image={image}
        inverted={true}
        background={"background-dark"}
    />
}


export const PresentacionWiki = () => {

    const description = <div className="mt-4 space-y-4">
        <p className={""}>
            Cada tema de discusión tiene asociado un artículo con el consenso de la plataforma, que cualquiera puede
            editar, como en Wikipedia.
        </p>
        <p className="">
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
        title={"Porque datos y discusión no pueden ir separados."}
        subtitle={"Estamos construyendo una wiki para la discusión pública."}
        description={description}
        image={image}
        inverted={false}
    />
}


export const PresentacionCalidadDeLaInformacion = () => {
    const itemIcon = <ChecksIcon className="mt-1" fontSize={36}/>
    const description = <div className={"space-y-4"}>
        <ul className="space-y-4 max-w-[400px]">
            <li className="flex items-start gap-2">
                {itemIcon}
                <span className={"w-full"}>
                Selección de contenido transparente y configurable, sin inteligencia artificial.
            </span>
            </li>
            <li className="flex items-start gap-2">
                {itemIcon}
                <span className={"w-full"}>
                Sin publicidad. Ni ahora ni nunca.
            </span>
            </li>
            <li className="flex items-start gap-2">
                {itemIcon}
                <span className={"w-full"}>
                Con interlocutores de verdad. Verificamos que todos los usuarios sean personas reales únicas.
            </span>
            </li>
        </ul>
    </div>

    return <FeatureSection
        title={"Para que nadie más que vos controle lo que llega a tu pantalla."}
        description={description}
        image={null}
        inverted={true}
        background={"background-dark"}
    />
}


export const PresentacionRemuneraciones = () => {
    const itemIcon = <ChecksIcon className="mt-1" fontSize={36}/>
    const description = <div className={"space-y-4"}>
        <ul className="space-y-4 max-w-[400px]">
            <li className="flex items-start gap-2">
                {itemIcon}
                <span className={"w-full"}>
                    Cabildo Abierto se financia con aportes voluntarios de sus usuarios.
                </span>
            </li>
            <li className="flex items-start gap-2">
                {itemIcon}
                <span className={"w-full"}>
                    Con eso, se remunera a cada autor de artículos o temas de la wiki según su
                    contribución y las lecturas que haya recibido.
                </span>
            </li>
        </ul>
    </div>

    return <FeatureSection
        title={"Porque las contribuciones se valoran."}
        subtitle={""}
        description={description}
        image={null}
        inverted={true}
    />
}


export const PresentacionAbierto = () => {
    const itemIcon = <ChecksIcon className="mt-1" fontSize={36}/>
    const description = <div className={"mt-4"}>
        <ul className="space-y-4 max-w-[400px]">
            <li className="flex items-start gap-2">
                {itemIcon}
                <span className={"w-full"}>
                    Cabildo Abierto usa <span className={""}>AT</span><span
                    className={""}>Protocol</span>, un sistema de redes sociales
                    descentralizadas que te da el control sobre tus datos y facilita la libre competencia
                    entre plataformas.
                </span>
            </li>
            <li className="flex items-start gap-2">
                {itemIcon}
                <span className={"w-full"}>
                    Además, el código de Cabildo Abierto es público (<Link target={"_blank"} className="hover:underline"
                                                                           href={"https://github.com/cabildo-abierto"}>acá</Link>),
                    para que cualquiera lo pueda revisar.
                </span>
            </li>
        </ul>
    </div>

    const image = <div className={"p-2"}>
        <div className="relative p-2">
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
    </div>

    return <FeatureSection
        title={"Porque los datos tienen que ser tuyos."}
        description={description}
        image={image}
        inverted={true}
        background={"background-dark"}
    />
}


export const PresentacionInicio = () => {

    return <>
        <div className="absolute top-4 right-4 w-48 z-10 md:hidden">
            <GoToLoginButton fontSize={12}/>
        </div>
        <div className="absolute top-10 right-10 z-10 hidden md:block">
            <GoToLoginButton fontSize={12}/>
        </div>
        <div className={"relative flex flex-col h-[500px] justify-center space-y-12 items-center"}>
            <div className="flex items-center flex-col space-y-12">
                <div className="flex flex-col items-center">
                    <Logo
                        width={80}
                        height={80}
                    />
                    {/*<div className={"uppercase text-center w-[80px] font-[400] leading-[1]"}>
                        <div>Cabildo</div>
                        <div className={"tracking-[0.026em]"}>Abierto</div>
                    </div>*/}
                </div>
                <h1 className={"text-xl text-center sm:text-2xl md:text-2xl font-bold uppercase"}>
                    Cabildo Abierto
                </h1>
                <div className="flex justify-center flex-col items-center">
                    <div
                        className="lg:text-[20px] px-6 border-t-[2px] border-b-[2px] border-[var(--text)] py-4 sm:text-[22px] text-[16px] font-light tracking-tight text-center leading-tight"
                    >
                        <div>Una plataforma para discutir en serio,</div>
                        <div className={"font-extrabold"}>
                            hecha en Argentina.
                        </div>
                    </div>
                </div>
            </div>
            <div className={"absolute bottom-[-40px] left-1/2"}>
                <ArrowDownIcon fontSize={24}/>
            </div>
        </div>
    </>
}