import React from "react";
import {DateSince} from "../ui-utils/date";
import {BasicButton} from "../ui-utils/basic-button";
import {useLayoutConfig} from "../layout/layout-config-context";

export type CongressProject = {
    title: string
    votesSenado?: {id: string, vote: string}[]
    votesDiputados?: {id: string, vote: string}[]
    stateSenado: {
        type: string
        date?: string
    }
    stateDiputados?: {
        type: string
        date?: string
    }
}

export const CongressResult = ({
    project,
    camara,
    className="px-1 space-x-1"
}: {
    project: CongressProject
    camara: string
    className?: string
}) => {

    if((camara == "Senadores" && !project.votesSenado) || (camara == "Diputados" && !project.votesDiputados)){
        return <div className={"flex bg-[var(--background-dark3)] my-1 rounded text-base " + className}>
            No se votó en {camara}
        </div>
    }

    let afi = 0
    let neg = 0
    let abs = 0
    let aus = 0

    const votes = camara == "Senadores" ? project.votesSenado : project.votesDiputados

    for (let i = 0; i < votes.length; i++) {
        if (votes[i].vote == "Afirmativo") afi++
        else if (votes[i].vote == "Negativo") neg++
        else if (votes[i].vote == "Abstención") abs++
        else if (votes[i].vote == "Ausente") aus ++
    }

    return <div className={"flex bg-[var(--background-dark3)] my-1 rounded " + className}>
        <div className={"text-green-400"}>{afi}</div>
        <div className={"text-yellow-400"}>{abs}</div>
        <div className={"text-red-400"}>{neg}</div>
        <div className={"text-gray-400"}>{aus}</div>
    </div>
}

export const ProjectCard = ({project, selected, setSelected} : {project: CongressProject, selected: boolean, setSelected: (v: boolean) => void}) => {


    return <div
        className={"cursor-pointer p-4 rounded border font-semibold w-full hover:bg-[var(--background-dark)] " + (selected ? "bg-[var(--background-dark2)]" : "")}
        onClick={() => {setSelected(!selected)}}
    >
        <div>
            {project.title}
        </div>
        <div className={"font-normal mt-2"}>
            {project.stateSenado && <div>
                {project.stateSenado.type == "rechazado" &&
                    <div className={"text-red-400 flex space-x-2 items-center"}>
                        <div>
                            Rechazado en el Senado {<DateSince date={new Date(project.stateSenado.date)}/>}
                        </div>
                    </div>
                }
            </div>}
        </div>
    </div>
}

export const Proyectos = ({
      projects,
      selectedProject,
      setSelectedProject
}: {
    selectedProject: number
    setSelectedProject: (i: number) => void
    projects: CongressProject[]
}) => {
    const {layoutConfig} = useLayoutConfig()

    return <div className={`flex flex-col items-center space-y-8 mb-64 w-full px-4 max-w-[${layoutConfig.maxWidthCenter}] mt-16`}>
        <h3>
            Proyectos
        </h3>
        {projects.map((p, index) => {

            function setSelected(v: boolean){
                if(v) setSelectedProject(index)
                else setSelectedProject(null)
            }

            return <div
                className={"w-full"}
                key={index}
            >
                <ProjectCard project={p} selected={selectedProject == index} setSelected={setSelected}/>
            </div>
        })}
    </div>
}