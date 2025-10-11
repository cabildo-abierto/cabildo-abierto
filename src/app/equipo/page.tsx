"use client"
import {Logo} from "../../components/layout/utils/logo";
import {BackButton} from "../../components/layout/utils/back-button";
import {useSession} from "@/queries/getters/useSession";
import Link from "next/link";
import {getBlueskyUrl, profileUrl} from "@/utils/uri";

const Username = ({handle}: { handle: string }) => {
    const {user} = useSession()
    if (user) {
        return <Link className="text-[var(--text-light)] hover:underline" href={profileUrl(handle)}>@{handle}</Link>
    } else {
        return <Link className="text-[var(--text-light)] hover:underline" target={"_blank"}
                     href={getBlueskyUrl(handle)}>@{handle}</Link>
    }
}

export default function Page() {
    return <div className={"flex flex-col items-center pb-16 pt-4"}>
        <div className={"w-screen px-2 sm:w-[600px] space-y-4"}>
            <BackButton behavior={"ca-back"}/>
            <div
                className={"space-y-4 bg-[var(--background-dark)] rounded-lg px-4 py-6 text-sm sm:text-base text-justify sm:p-8"}
            >
                <h2 className={"text-left py-2"}>
                    ¿Quiénes somos?
                </h2>
                <div className={"space-y-1"}>
                    <h3>El equipo</h3>
                    <div>
                        Cabildo Abierto es desarrollada y mantenida por un equipo de dos personas: Tomás Delgado
                        (<Username
                        handle={"tomasdelgado.ar"}/>) y Luca Zanela (<Username handle={"lucardino.bsky.ar"}/>).
                        Tomás estudió Cs. de la Computación en la Facultad de Ciencias Exactas y Naturales de la UBA y
                        Luca
                        es estudiante avanzado de Cs. Matemáticas en la misma facultad.
                        Los dos tenemos otros trabajos además de la plataforma y esperamos eventualmente poder dedicar más tiempo al desarrollo.
                    </div>
                </div>
                <div className={"space-y-1"}>
                    <h3>¿Por qué Cabildo Abierto?</h3>
                    <div>
                        Porque vemos deficiencias importantes en cómo se está dando la discusión pública a través de
                        internet y
                        creemos que, aunque no todo pase por la tecnología, hay mucho que se puede hacer mejor.
                        Cabildo Abierto es una plataforma independiente construída para mejorar colectivamente la calidad de la
                        información a la que accedemos y
                        facilitar discusiones genuinas eliminando filtros artificiales.
                    </div>
                </div>
                <div className={"space-y-1"}>
                    <h3>¡Sumate!</h3>
                    <div>
                        Si te interesa aportar a la discusión pública contruyendo mejores herramientas y espacios de
                        discusión y no te importa que por ahora no tengamos financiamiento para pagar salarios,
                        escribinos y hacemos una reunión. Estamos buscando especialistas en comunicación, pero escuchamos cualquier propuesta.
                        Si programás podés pasar por nuestro <Link
                        className="text-[var(--text-light)] hover:underline"
                        href={"https://github.com/cabildo-abierto"}>github</Link>.
                    </div>
                </div>
                <div className={"w-full flex justify-center"}>
                    <Logo width={48} height={48}/>
                </div>
            </div>
        </div>
    </div>
}