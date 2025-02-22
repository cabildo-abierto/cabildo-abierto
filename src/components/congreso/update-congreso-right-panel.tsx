import investigadora from "../../../public/congreso/investigadora.json";
import {CongressProject, CongressResult} from "./proyectos";
import {DateSince} from "../date";
import React from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {IconButton} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export const projects = [
    investigadora
]

const ProjectSmallCard = ({project}: {project: CongressProject}) => {
    const router = useRouter()
    return <div
        className={"p-2 rounded text-center flex flex-col items-center hover:bg-[var(--background-dark)] cursor-pointer"}
        onClick={() => {router.push("/congreso?p="+project.title)}}
    >
        <div className={"truncate font-semibold text-sm"}>
            {project.title}
        </div>
        <div className={"font-normal text-sm "}>
            {project.stateSenado && project.stateSenado.type == "rechazado" &&
                <div className={"flex space-x-1 items-center text-[var(--text-light)] text-center"}>
                    <div className={" flex space-x-1 items-center"}>
                        <div className={"text-red-400"}>Rechazado</div>
                        <div>en el Senado</div>
                    </div>
                    <div>•</div>
                    <div>
                        <DateSince date={new Date(project.stateSenado.date)}/>
                    </div>
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
    return <div className={"border rounded p-2 w-full"}>
        <div className={"flex justify-between items-center"}>
            <Link href={"/congreso"} className={"text-[var(--text-light)] text-xs"}>
                En el congreso
            </Link>
            <Link href={"/congreso"} className={"text-[var(--text-light)] text-xs"}>
                Ver más
            </Link>
        </div>
        <div className={"mt-1"}>
            <ProjectSlider/>
        </div>

    </div>
}