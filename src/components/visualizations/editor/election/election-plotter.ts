import {DatasetForTableView} from "@/components/datasets/dataset-table-view";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {Plotter} from "@/components/visualizations/editor/plotter/plotter";
import {cleanText} from "@/utils/strings";
import { unique } from "@/utils/arrays";


export type Candidato = {
    nombre: string
    posicion: number
    subcargo: Subcargo
    alianza: string
    distrito: string
    cargo: Cargo
    idTema?: string
    idTemaAlianza?: string
    idTemaDistrito?: string
}

const provincias: {
    nombre: string,
    sinonimos: string[]
}[] = [
    { nombre : "Capital Federal", sinonimos: ["caba", "ciudad autonoma de buenos aires", "ciudad de buenos aires", "capital"]},
    { nombre: "Buenos Aires", sinonimos: [] },
    { nombre: "Catamarca", sinonimos: [] },
    { nombre: "Chaco", sinonimos: [] },
    { nombre: "Chubut", sinonimos: [] },
    { nombre: "Córdoba", sinonimos: [] },
    { nombre: "Corrientes", sinonimos: [] },
    { nombre: "Entre Ríos", sinonimos: [] },
    { nombre: "Formosa", sinonimos: [] },
    { nombre: "Jujuy", sinonimos: [] },
    { nombre: "La Pampa", sinonimos: [] },
    { nombre: "La Rioja", sinonimos: [] },
    { nombre: "Mendoza", sinonimos: [] },
    { nombre: "Misiones", sinonimos: [] },
    { nombre: "Neuquén", sinonimos: [] },
    { nombre: "Río Negro", sinonimos: [] },
    { nombre: "Salta", sinonimos: [] },
    { nombre: "San Juan", sinonimos: [] },
    { nombre: "San Luis", sinonimos: [] },
    { nombre: "Santa Cruz", sinonimos: [] },
    { nombre: "Santa Fe", sinonimos: [] },
    { nombre: "Santiago del Estero", sinonimos: ["s del estero"] },
    { nombre: "Tierra del Fuego, Antártida e Islas del Atlántico Sur", sinonimos: ["tierra del fuego", "t del fuego"] },
    { nombre: "Tucumán", sinonimos: [] }
];



function strictCleanText(s: string): string {
    return s.toLowerCase().replace(/[^a-z]|[aeiou]/g, "")
}


export function getProvinceName(p: string): string {
    p = strictCleanText(p)

    for(let i = 0; i < provincias.length; i++) {
        const candidate = provincias[i]
        if([candidate.nombre, ...candidate.sinonimos].some(x =>
            strictCleanText(x) == p
        )) {
            return candidate.nombre
        }
    }

    return "error"
}

export type Cargo = "Senadores" | "Diputados"

const cargos: {nombre: Cargo, sinonimos: string[]}[] = [
    {
        nombre: "Senadores",
        sinonimos: [
            "Senador",
            "Senador nacional",
            "Senadores nacionales"
        ]
    },
    {
        nombre: "Diputados",
        sinonimos: [
            "Diputado",
            "Diputado nacional",
            "Diputados nacionales"
        ]
    }
]

type Subcargo = "Titular" | "Suplente"

const subcargos: {nombre: Subcargo, sinonimos: string[]}[] = [
    {
        nombre: "Titular",
        sinonimos: ["Titulares"]
    },
    {
        nombre: "Suplente",
        sinonimos: ["Suplentes"]
    }
]


export type SearchResult = {
    type: "alianza",
    nombre: string,
    distrito: string
} | {
    type: "candidato",
    candidato: Candidato
}


export function getSubcargo(p: string): Subcargo {
    p = strictCleanText(p)

    for(let i = 0; i < subcargos.length; i++) {
        const candidate = subcargos[i]
        if([candidate.nombre, ...candidate.sinonimos].some(x =>
            strictCleanText(x) == p
        )) {
            return candidate.nombre
        }
    }
}


export function getCargo(p: string | null): Cargo {
    p = strictCleanText(p)

    for(let i = 0; i < cargos.length; i++) {
        const candidate = cargos[i]
        if([candidate.nombre, ...candidate.sinonimos].some(x =>
            strictCleanText(x) == p
        )) {
            return candidate.nombre
        }
    }
}


export class ElectionPlotter extends Plotter {
    searchValue: string | undefined
    electionSpec: ArCabildoabiertoEmbedVisualization.Eleccion
    candidatesByProvince: Map<string, Map<string, [Candidato[], Candidato[]]>> = new Map()
    candidates: Candidato[]

    constructor(
        spec: ArCabildoabiertoEmbedVisualization.Main["spec"],
        dataset: DatasetForTableView,
        searchValue?: string
    ) {
        super(spec, dataset, undefined)
        this.searchValue = searchValue
        if(ArCabildoabiertoEmbedVisualization.isEleccion(spec)){
            this.electionSpec = spec
        } else {
            throw Error("Visualization should be election!")
        }
    }

    prepareForPlot(prev?: ElectionPlotter): {error?: string} {
        if(this.electionSpec.tipoDeEleccion != "Legislativa") {
            return {error: "Este tipo de elección todavía no está soportado."}
        }

        if(this.electionSpec.region != "Nacional"){
            return {error: "Por ahora solo está soportada la región Nacional."}
        }

        const candidateCol = this.electionSpec.columnaNombreCandidato
        const districtCol = this.electionSpec.columnaDistritoCandidato
        const positionCol = this.electionSpec.columnaPosicion
        const titularCol = this.electionSpec.columnaSubcargo
        const alianzaCol = this.electionSpec.columnaAlianza
        const cargoCol = this.electionSpec.columnaCargo
        const idTemaCol = this.electionSpec.columnaTopicIdCandidato
        const idAlianzaCol = this.electionSpec.columnaTopicIdAlianza
        const idDistritoCol = this.electionSpec.columnaTopicIdDistrito

        if(!candidateCol) {
            return {error: "Indicá una columna con el nombre del candidato."}
        } else if(!districtCol) {
            return {error: "Indicá una columna con el distrito del candidato."}
        } else if(!alianzaCol) {
            return {error: "Indicá una columna con la alianza del candidato."}
        } else if(!cargoCol) {
            return {error: "Indicá una columna con el cargo al que se postula el candidato."}
        } else if(!titularCol) {
            return {error: "Indicá una columna con el subcargo del candidato (titular o suplente)."}
        }

        if([candidateCol, districtCol, titularCol,
            alianzaCol, cargoCol, idTemaCol, idAlianzaCol, idDistritoCol].some(x => x && !this.columns.some(c => c.name == x))){
            return {error: "Columna inválida."}
        }

        super.prepareForPlot(prev)

        this.candidates = []
        this.data.forEach(r => {
            const alianza: string = r[alianzaCol]
            const subcargo = getSubcargo(r[titularCol])
            const nombre = r[candidateCol]
            const cargo = getCargo(r[cargoCol])
            const candidato: Candidato = {
                nombre,
                posicion: r[positionCol] != null ? Number(r[positionCol]) : null,
                subcargo,
                alianza,
                distrito: getProvinceName(r[districtCol]),
                cargo,
                idTema: r[idTemaCol],
                idTemaAlianza: r[idAlianzaCol],
                idTemaDistrito: r[idDistritoCol],
            }
            this.candidates.push(candidato)
        })

        return {}
    }

    getCandidatesForDistrict(p: string | null, cargo: Cargo) {
        if(!p) return null
        const pNorm = getProvinceName(p)
        const key = `${pNorm}:${cargo}`
        const cur = this.candidatesByProvince.get(key)
        if(cur) return cur

        const m = new Map<string, [Candidato[], Candidato[]]>()


        this.candidates
            .filter(r => {
                return r.distrito == pNorm && r.cargo == cargo
            })
            .forEach(r => {
                const cur = m.get(r.alianza)


                if(r.subcargo == "Titular"){
                    if(!cur) m.set(r.alianza, [[r], []])
                    else cur[0].push(r)
                } else {
                    if(!cur) m.set(r.alianza, [[], [r]])
                    else cur[1].push(r)
                }
            })

        this.candidatesByProvince.set(key, m)
        return m
    }

    getSearchResults(s: string): SearchResult[] {
        s = cleanText(s)

        const results: SearchResult[] = []
        this.candidates.forEach(r => {
            if(cleanText(r.nombre).includes(s)){
                results.push({
                    type: "candidato",
                    candidato: r
                })
            }
            if(cleanText(r.alianza).includes(s)){
                results.push({
                    type: "alianza",
                    nombre: r.alianza,
                    distrito: r.distrito
                })
            }
        })
        return Array.from(results.values())
    }

    getAlianza(alianza: string, distrito: string): [Candidato[], Candidato[]] {
        const candidatos = this.candidates
            .filter(r => {
                return r.alianza == alianza && r.distrito == distrito
            })

        const titulares = candidatos
            .filter(r => {
                return r.subcargo == "Titular"
            })

        const suplentes = candidatos
            .filter(r => {
                return r.subcargo == "Suplente"
            })

        return [titulares, suplentes]
    }

    getCandidate(nombre: string): Candidato {
        return this.candidates.find(x => x.nombre == nombre)
    }

    getDistrictsForAlianza(nombre: string): string[] {
        return unique(this.candidates
            .filter(x => x.alianza == nombre)
            .map(r => r.distrito)
        )
    }

    getDistrictTopicId(district: string) {
        for(const x of this.candidates) {
            if(x.distrito == district) {
                return x.idTemaDistrito
            }
        }
        return null
    }
}