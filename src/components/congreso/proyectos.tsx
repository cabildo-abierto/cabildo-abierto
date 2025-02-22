import React from "react";
import {DateSince} from "../date";

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
    votes,
    className="px-1 space-x-1"
}: {
    votes: {id: string, vote: string}[]
    className?: string
}) => {

    let afi = 0
    let neg = 0
    let abs = 0
    let aus = 0

    for(let i = 0; i < votes.length; i++){
        if(votes[i].vote == "Afirmativo") afi ++
        else if(votes[i].vote == "Negativo") neg ++
        else if(votes[i].vote == "Abstención") abs ++
        else if(votes[i].vote == "Ausente") aus ++
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
        className={"cursor-pointer p-4 rounded border font-semibold w-full"}
    >
        <div>
            {project.title}
        </div>
        <div className={"font-normal mt-2"}>
            {project.stateSenado && <button className="hover:bg-[var(--background-dark2)] px-2 rounded bg-[var(--background-dark)]" onClick={() => {setSelected(true)}}>
                {project.stateSenado.type == "rechazado" && <div className={"text-red-400 flex space-x-2 items-center"}>
                    <div>Rechazado en el Senado {<DateSince date={new Date(project.stateSenado.date)}/>}</div> {<CongressResult votes={project.votesSenado}/>}
                </div>}
            </button>}
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
    return <div className={"flex flex-col items-center space-y-8 mb-64 w-[600px]"}>
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