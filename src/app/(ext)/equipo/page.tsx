"use client"
import Link from "next/link";
import {profileUrl, topicUrl} from "@/utils/uri";
import {Paragraph} from "@/components/layout/base/paragraph";
import {ReactNode} from "react";
import {PageFrame} from "@/components/layout/utils/page-frame";


const TeamSection = ({title, children}: {
    title: string
    children: ReactNode
}) => {
    return <div className={""}>
        <h4 className={"font-bold uppercase text-sm text-[var(--text-light)]"}>
            {title}
        </h4>
        <div className={"flex flex-col"}>
            {children}
        </div>
    </div>
}


const TeamMember = ({handle, name}: {
    handle: string
    name: string
}) => {
    return <span>
        {name} (<Link
        className="text-[var(--text-light)] hover:underline"
        href={profileUrl(handle)}
    >
                @{handle}
        </Link>).
    </span>
}

export default function Page() {
    return <PageFrame>
        <div
            className={"space-y-4 pb-6 text-justify"}
        >
            <Paragraph>
                Cabildo Abierto es un proyecto iniciado en mayo de 2024 con el objetivo de proponer una alternativa para
                las herramientas que usamos en Argentina para discutir e informarnos a través de internet. Buscamos
                poner la tecnología al servicio de la discusión y ofrecer soberanía a nuestro país con respecto a las
                plataformas que usamos para comunicarnos.
            </Paragraph>
            <Paragraph>
                Durante noviembre y ocutubre de 2024 estuvo abierta una primera versión de la plataforma y en julio de
                2025 abrimos el período de prueba de la versión actual, desarrollada sobre un ecosistema abierto que se llama <Link
                href={topicUrl("ATProtocol")}>ATProtocol</Link>.
            </Paragraph>
            <h3 className={"tracking-[0.0167em] font-bold uppercase text-base"}>
                Equipo
            </h3>
            <div className={"space-y-3"}>
                <TeamSection title={"Desarrollo"}>
                    <TeamMember name={"Tomás Delgado"} handle={"tomas.cabildo.ar"}/>
                    <TeamMember name={"Luca Zanela"} handle={"lucardino.bsky.social"}/>
                </TeamSection>
                <TeamSection title={"Diseño gráfico"}>
                    <TeamMember name={"Julieta De Cicco"} handle={"julidecicco.bsky.social"}/>
                </TeamSection>
                <TeamSection title={"Consultoría"}>
                    <TeamMember name={"Paulina Becerra"} handle={"soypaulina.bsky.ar"}/>
                    <TeamMember
                        name={"Facundo De Dios"}
                        handle={"iknash.bsky.social"}
                    />
                </TeamSection>
            </div>
            <div className={"space-y-1"}>
                <h3 className={"tracking-[0.0167em] font-bold uppercase text-base"}>Sumate</h3>
                <Paragraph>
                    Si te interesa aportar a la discusión pública contruyendo mejores herramientas y espacios de
                    discusión, escribinos. Tenemos una <Link href={"/sumate/comunicacion"}>búsqueda activa</Link> de alguien
                    que se especialice en comunicación, pero escuchamos cualquier propuesta.
                    Si programás también podés pasar por nuestro <Link
                    className=""
                    href={"https://github.com/cabildo-abierto"}>GitHub</Link>.
                </Paragraph>
            </div>
        </div>
    </PageFrame>
}