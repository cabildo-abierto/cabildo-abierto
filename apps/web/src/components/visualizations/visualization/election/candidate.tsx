import {
    Candidato
} from "./election-plotter";
import React from "react";
import {TopicLinkButton, TopicMentionsLinkButton} from "./topic-link-button";
import {CandidateProfilePic, TopicRepliesCount} from "./distrito-comp";



export const SingleCandidateAttr = ({value}: { value: string | number | null }) => {
    if (value == null) {
        return "Sin cargar."
    } else {
        return value+"."
    }
}


export const ListCandidateAttr = ({value}: { value: string[] | null }) => {
    if (value == null) {
        return "Sin cargar."
    } else if (value.length == 0) {
        return "Ninguno."
    } else {
        return value.map((v, i) => {
            return <div key={i} className={""}>
                {v}.
            </div>
        })
    }
}

export const CandidateComp = ({c, height}: {
    c: Candidato
    height: number
}) => {
    return <div
        onWheel={e => e.stopPropagation()}
        className={"p-6 flex flex-col space-y-2 overflow-y-auto custom-scrollbar"} style={{height}}>
        <div className={""}>
            <CandidateProfilePic c={c} width={120} height={120} border={true}/>
        </div>
        <h3 className={"capitalize"}>
            {c.nombre.toLowerCase()}
        </h3>
        <div className={"flex space-x-2 items-center"}>
            <TopicLinkButton id={c.idTema}/>
            <TopicMentionsLinkButton id={c.idTema}/>
            <TopicRepliesCount elem={{type: "candidato", value: c}}/>
        </div>
        <div className={"text-sm"}>
            <div className={"font-light text-[var(--text-light)]"}>
                Candidato a
            </div>
            <div>
                {c.cargo == "Senadores" ? "Senador" : "Diputado"}.
            </div>
        </div>
        <div className={"text-sm"}>
            <div className={"font-light text-[var(--text-light)]"}>
                Alianza
            </div>
            <div>
                {c.alianza.nombre}.
            </div>
        </div>
        <div className={"text-sm"}>
            <div className={"font-light text-[var(--text-light)]"}>
                Distrito
            </div>
            <div>
                {c.alianza.distrito.nombre}.
            </div>
        </div>
        <div className={"text-sm"}>
            <div className={"font-light text-[var(--text-light)]"}>
                Posición en la lista
            </div>
            <SingleCandidateAttr value={c.posicion.toString()+"° "+(c.subcargo.toLowerCase())}/>
        </div>
        <div className={"text-sm"}>
            <div className={"font-light text-[var(--text-light)]"}>
                Antecedentes académicos
            </div>
            <ListCandidateAttr value={c.antecedentesAcad}/>
        </div>
        <div className={"text-sm"}>
            <div className={"font-light text-[var(--text-light)]"}>
                Antecedentes profesionales
            </div>
            <ListCandidateAttr value={c.antecedentesProf}/>
        </div>
        <div className={"text-sm"}>
            <div className={"font-light text-[var(--text-light)]"}>
                Antecedentes en el Estado
            </div>
            <ListCandidateAttr value={c.antecedentesEstado}/>
        </div>
        <div className={"text-sm"}>
            <div className={"font-light text-[var(--text-light)]"}>
                Espacios políticos anteriores
            </div>
            <ListCandidateAttr value={c.espaciosPoliticosAnt}/>
        </div>
        <div className={"text-sm"}>
            <div className={"font-light text-[var(--text-light)]"}>
                Patrimonio declarado
            </div>
            <SingleCandidateAttr value={c.patrimonio}/>
        </div>
        <div className={"text-sm"}>
            <div className={"font-light text-[var(--text-light)]"}>
                Controversias.
            </div>
            <ListCandidateAttr value={c.controversias}/>
        </div>
        <div className={"text-sm"}>
            <div className={"font-light text-[var(--text-light)]"}>
                Otros datos
            </div>
            <ListCandidateAttr value={c.otrosDatos}/>
        </div>
    </div>
}