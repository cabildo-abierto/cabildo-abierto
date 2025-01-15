"use client"
import React, {useState} from "react";
import {BasicButton} from "../../components/ui-utils/basic-button";
import '../../components/datasets/index.css'
import AddIcon from "@mui/icons-material/Add";
import {TextField} from "@mui/material";
import {useCabildos} from "../../hooks/contents";
import {CabildoProps} from "../lib/definitions";
import {BaseFullscreenPopup} from "../../components/ui-utils/base-fullscreen-popup";
import {ErrorMsg} from "../../components/write-button";
import StateButton from "../../components/state-button";
import {createCabildo} from "../../actions/cabildos";
import PersonIcon from "@mui/icons-material/Person";
import Link from "next/link";
import {cabildoUrl} from "../../components/utils";


const CabildoPreview = ({cabildo}: {cabildo: CabildoProps}) => {
    return <Link className="flex flex-col p-2 w-full hover:bg-[var(--background-dark)] cursor-pointer" href={cabildoUrl(cabildo.cabildo.name)}>
        <>
            <div>
                {cabildo.cabildo.name}
            </div>
            <div className={"text-[var(--text-light)] text-sm"}>
                {cabildo.cabildo.members.length} <PersonIcon fontSize={"inherit"}/>
            </div>
        </>
    </Link>
}


const CreateCabildoModal = ({open, onClose}: {open: boolean, onClose: () => void}) => {
    const [cabildoName, setCabildoName] = useState("")
    const [errorOnCreate, setErrorOnCreate] = useState("")

    function validCabildoName(name: string){
        return true
    }

    async function onCreate() {
        const {error} = await createCabildo(cabildoName)
        if(error){
            return {error}
        } else {
            onClose()
            return {}
        }
    }

    return <BaseFullscreenPopup open={open} onClose={onClose} closeButton={true}>
        <div className="space-y-10 px-6 mb-4 flex flex-col items-center">
            <h3>Elegí un nombre para el cabildo</h3>
            <div>
                <TextField
                    value={cabildoName}
                    label={"Nombre"}
                    size={"small"}
                    onChange={(e) => setCabildoName(e.target.value)}
                    placeholder="Nombre"
                    inputProps={{
                        autoComplete: 'off', // Disables browser autocomplete
                    }}
                />
            </div>
            {errorOnCreate && <ErrorMsg text={errorOnCreate}/>}
            {cabildoName.includes("/") && <ErrorMsg text="El nombre no puede incluír el caracter '/'."/>}

            <div className="">
                <StateButton
                    handleClick={onCreate}
                    disabled={!validCabildoName(cabildoName)}
                    textClassName="title px-4"
                    text1="Crear cabildo"
                />
            </div>

        </div>
    </BaseFullscreenPopup>
}


const Page = () => {
    const {cabildos} = useCabildos()
    const [createCabildoModalOpen, setCreateCabildoModalOpen] = useState(false)


    return <div className={"flex flex-col"}>
        <div className="flex border-b items-center justify-between pr-2">
            <BasicButton
                startIcon={<AddIcon/>}
                variant={"text"}
                size={"small"}
                sx={{height: "32px", width: "168px"}}
                onClick={() => {
                    setCreateCabildoModalOpen(true)
                }}
            >
                Nuevo cabildo
            </BasicButton>
        </div>

        <div className={"flex flex-col"}>
            {cabildos && cabildos.map((c, index) => {
                return <div key={index} className={"border-b"}>
                    <CabildoPreview cabildo={c}/>
                </div>
            })}
        </div>

        <CreateCabildoModal open={createCabildoModalOpen} onClose={() => {
            setCreateCabildoModalOpen(false)
        }}/>
    </div>
}


export default Page