import investigadora from "../../../public/congreso/investigadora.json";
import {CongressProject} from "./proyectos";
import {DateSince} from "../../../modules/ui-utils/src/date";
import React from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {FooterHorizontalRule} from "../../../modules/ui-utils/src/footer";
import {urlCongreso} from "@/utils/uri";

export const projects = [
    investigadora
]

const ProjectSmallCard = ({project}: {project: CongressProject}) => {
    const router = useRouter()
    return <div
        className={"p-2 rounded text-center flex flex-col items-center hover:bg-[var(--background-dark)] cursor-pointer"}
        onClick={() => {router.push("/temas/congreso?p="+project.title)}}
    >
        <div className={"truncate font-semibold text-sm max-w-full"}>
            {project.title}
        </div>
        <div className={"font-normal text-sm px-2"}>
            {project.stateSenado && project.stateSenado.type == "rechazado" &&
                <div className={"space-x-1 text-[var(--text-light)] text-xs text-center whitespace-nowrap"}>
                    <span className={"text-red-400"}>Rechazado</span>
                    <span>en el Senado</span>
                    <span>
                        <DateSince date={new Date(project.stateSenado.date)}/>
                    </span>
                </div>
            }
        </div>
    </div>
}

const ProjectSlider = () => {
    return <div className={""}>
        <ProjectSmallCard project={projects[0]}/>
    </div>
}


export const UpdateCongresoRightPanel = () => {
    return (
        <div className={"px-2 py-3 border rounded"}>
            <div className={"flex justify-between items-center"}>
                <span className={"text-[var(--text-light)] text-xs"}>
                    En el congreso
                </span>
                <Link href={urlCongreso} className={"text-[var(--text-light)] text-xs"}>
                    Ver más
                </Link>
            </div>
            <div className={"mt-1"}>
                <ProjectSlider/>
            </div>
        </div>
    )
}