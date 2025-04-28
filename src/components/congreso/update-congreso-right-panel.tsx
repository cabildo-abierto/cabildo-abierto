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
    return <ProjectSmallCard project={projects[0]}/>
}


export const UpdateCongresoRightPanel = () => {
    return (
        <div className={"p-3 space-y-3 rounded-lg border"}>
            <div className={"flex justify-between items-center"}>
                <span className={"text-xs font-bold"}>
                    En el congreso
                </span>
            </div>
            <div className={"mt-1"}>
                <ProjectSlider/>
            </div>
        </div>
    )
}
