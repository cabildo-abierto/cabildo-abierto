"use client"
import {Logo} from "../../../modules/ui-utils/src/logo";
import {BackButton} from "../../../modules/ui-utils/src/back-button";
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
        <div className={"w-screen px-4 font-light sm:w-[600px] space-y-4"}>
            <BackButton behavior={"ca-back"}/>
            <div
                className={"space-y-4 pt-4 pb-6 text-sm sm:text-base text-justify"}
            >
                <h2 className={"text-left py-2"}>
                    ¿Quiénes somos?
                </h2>
                <div className={"space-y-1"}>
                    <h3>El equipo</h3>
                    <div>
                        El equipo de Cabildo Abierto está compuesto actualmente por tres personas: dos desarrolladores (<Username
                        handle={"tomasdelgado.ar"}/> y <Username handle={"lucardino.bsky.social"}/>) y
                        una diseñadora gráfica (<Username handle={"julidecicco.bsky.social"}/>). Los tres somos de Buenos Aires
                        y nos formamos en la UBA. Tomás empezó a trabajar en la idea en mayo de 2024, Luca se sumó a principios de este año y Juli
                        es la incorporación más reciente.
                    </div>
                </div>
                <div className={"space-y-1"}>
                    <h3>¿Por qué Cabildo Abierto?</h3>
                    <div>
                        Porque vemos deficiencias importantes en cómo se está dando la discusión pública a través de
                        internet y
                        creemos que, aunque no todo pase por la tecnología, hay mucho que se podría estar haciendo mejor en ese sentido.
                        Cabildo Abierto es una plataforma independiente construída con el objetivo de mejorar colectivamente la calidad de la
                        información a la que accedemos, eliminar filtros artificiales y facilitar discusiones genuinas.
                    </div>
                </div>
                <div className={"space-y-1"}>
                    <h3>¡Sumate!</h3>
                    <div>
                        Si te interesa aportar a la discusión pública contruyendo mejores herramientas y espacios de
                        discusión, escribinos. Tenemos una <Link className="text-[var(--text-light)] hover:underline" href={"/sumate/comunicacion"}>búsqueda activa</Link> de alguien
                        que se especialice en comunicación, pero escuchamos cualquier propuesta.
                        Si programás también podés pasar por nuestro <Link
                        className="text-[var(--text-light)] hover:underline"
                        href={"https://github.com/cabildo-abierto"}>github</Link>.
                    </div>
                </div>
                <div className={"w-full flex justify-center pt-6"}>
                    <Logo width={32} height={32}/>
                </div>
            </div>
        </div>
    </div>
}