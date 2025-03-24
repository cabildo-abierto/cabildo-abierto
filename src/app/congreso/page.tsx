"use client"
import React, {use, useState} from "react";
import SelectionComponent from "../../components/search/search-selection-component";
import {Button} from "@mui/material";
import {BancasDiputados, BancasSenadores} from "../../components/congreso/bancas";
import {Proyectos} from "../../components/congreso/proyectos";
import {projects} from "../../components/congreso/update-congreso-right-panel";
import {MobileHeader} from "../../components/layout/mobile-header";


function getProjectByName(title: string){
    for(let i = 0; i<projects.length; i++){
        if(projects[i].title == title){
            return i
        }
    }
    return null
}


export default function Page({searchParams}: {searchParams: Promise<{p: string}>}) {
    const {p} = use(searchParams)
    const [selected, setSelected] = useState("Senadores")
    const [selectedProject, setSelectedProject] = useState<number>(getProjectByName(p))

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] w-32 h-10">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0,
                    borderRadius: 0
                }}
            >
                <div className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div className={"flex flex-col items-center"}>
        <MobileHeader/>

        <h2 className={"mt-12"}>
            Congreso
        </h2>

        {selectedProject != null && <div className={"mt-8 flex flex-col items-center"}>
            <div className={"text-[var(--text-light)]"}>
                Resultados de <span className={"font-semibold"}>{projects[selectedProject].title}</span>
            </div>
        </div>}

        <div className={"mt-6 flex flex-col items-center"}>
            <SelectionComponent
                onSelection={(v) => {setSelected(v)}}
                options={["Senadores", "Diputados"]}
                selected={selected}
                optionsNodes={optionsNodes}
                className="flex justify-between"
            />
            <div className={""}>
                {selected == "Senadores" ?
                    <BancasSenadores project={selectedProject != null ? projects[selectedProject] : undefined}/> :
                    <BancasDiputados project={projects[selectedProject]}/>}
            </div>
        </div>

        <Proyectos
            projects={projects}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
        />
    </div>
}