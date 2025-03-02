"use client"
import senadores from "../../../../public/congreso/senadores.json";
import {useEffect, useState} from "react";
import {TextField} from "@mui/material";
import {BasicButton} from "../../../components/ui-utils/basic-button";
import {getId, getVote} from "../../../components/congreso/utils";


const VoteSelector = ({ options, value, onChange }: {
    options: string[]
    value: string
    onChange: (v: string) => void
}) => {
    const colors = ["bg-green-400", "bg-red-400", "bg-blue-400", "bg-yellow-400"]


    return (
        <div className="flex space-x-3">
            {options.map((option, index) => (
                <button
                    key={option}
                    className={"rounded-full w-6 h-6 " + (option == value ? colors[index] : "")}
                    onClick={() => onChange(option)}
                >
                    {option.slice(0, 2)}
                </button>
            ))}
        </div>
    );
};



export default function Page() {
    const [title, setTitle] = useState("");
    const [votes, setVotes] = useState<{id: string, vote: string}[]>([])

    useEffect(() => {
        const v = senadores.table.rows.map((s) => {
            return {id: getId(s), vote: "Negativo"}
        })
        setVotes(v)
    }, [])

    function getProyect(){
        return {
            title,
            votes
        }
    }

    function removeVote(id: string){
        return votes.filter((v) => v.id != id)
    }

    return <div className={"flex flex-col items-center space-y-4 mb-32"}>
        <h1>Cargar proyecto</h1>

        <div className={"w-[500px]"}>
            <TextField
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                label={"Título"}
                size={"small"}
                fullWidth
            />
        </div>

        {senadores.table.rows.map((s, index) => {
            return <div key={index} className={"flex items-center w-[500px] justify-between hover:bg-[var(--background-dark)] p-2"}>
                <div className={"truncate w-64"}>
                    {s.APELLIDO} {s.NOMBRE}
                </div>
                <div className={"w-32"}>
                    <VoteSelector
                        options={["Afirmativo", "Negativo", "Abstención", "Ausente"]}
                        value={getVote(getId(s), votes)}
                        onChange={(v) => {
                            setVotes([...removeVote(getId(s)), {id: getId(s), vote: v}])
                        }}
                    />
                </div>

            </div>
        })}

        <BasicButton
            onClick={() => {console.log(getProyect())}}
        >
            Imprimir
        </BasicButton>
    </div>
}