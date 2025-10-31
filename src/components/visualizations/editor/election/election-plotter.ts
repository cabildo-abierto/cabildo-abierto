import {DatasetForTableView} from "@/components/visualizations/datasets/dataset-table-view";
import {ArCabildoabiertoEmbedVisualization, ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {Plotter} from "@/components/visualizations/editor/plotter/plotter";
import {cleanText} from "@/utils/strings";
import {count, unique} from "@/utils/arrays";
import {TopicData} from "@/components/visualizations/editor/election/election-visualization-comp";
import {getTopicProp} from "@/components/topics/topic/utils";
import {TopicProp} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


export type Alianza = {
    nombre: string
    distrito: Distrito
    partidos?: string[]
    idTema?: string
    foto?: string
    propuestas?: string[]
    otrosDatos?: string[]
    replyCount?: number
}


export type Distrito = {
    nombre: string
    idTema?: string
    replyCount?: number
    cantSenadores?: number
    cantDiputados?: number
}


export type Candidato = {
    nombre: string
    posicion: number
    subcargo: Subcargo
    alianza: Alianza
    cargo: Cargo
    foto?: string
    idTema?: string
    antecedentesAcad?: string[]
    antecedentesProf?: string[]
    antecedentesEstado?: string[]
    espaciosPoliticosAnt?: string[]
    patrimonio?: number
    controversias?: string[]
    otrosDatos?: string[]
    replyCount?: number
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
    return s?.toLowerCase().replace(/[^a-z]|[aeiou]/g, "")
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


export type ElectionElement = {
    type: "alianza",
    value: Alianza
} | {
    type: "candidato",
    value: Candidato
} | {
    type: "distrito",
    value: Distrito
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


function getStringListProp(name: string, props: TopicProp[]): string[] | null {
    const prop = getTopicProp(name, props)
    if(!prop) return null
    if(ArCabildoabiertoWikiTopicVersion.isStringListProp(prop.value)) {
        return prop.value.value
    }
    return null
}


function getNumberProp(name: string, props: TopicProp[]): number | null {
    const prop = getTopicProp(name, props)
    if(!prop) return null
    if(ArCabildoabiertoWikiTopicVersion.isNumberProp(prop.value)) {
        return prop.value.value
    }
    return null
}


function getStringProp(name: string, props: TopicProp[]): string | null {
    const prop = getTopicProp(name, props)
    if(!prop) return null
    if(ArCabildoabiertoWikiTopicVersion.isStringProp(prop.value)) {
        return prop.value.value
    }
    return null
}


export class ElectionPlotter extends Plotter {
    searchValue: string | undefined
    electionSpec: ArCabildoabiertoEmbedVisualization.Eleccion
    candidatesByDistrict: Map<string, Map<string, [Candidato[], Candidato[]]>> = new Map()
    candidates: Candidato[]
    topicsData: Map<string, TopicData>
    nameToTopicId: Map<string, string> = new Map()
    districts: Map<string, Distrito> = new Map()
    cargosPorDistrito: Map<string, number> = new Map()

    constructor(
        spec: ArCabildoabiertoEmbedVisualization.Main["spec"],
        dataset: DatasetForTableView,
        topicsData: TopicData[],
        searchValue?: string,
    ) {
        super(spec, dataset, undefined)
        this.searchValue = searchValue
        this.topicsData = new Map<string, TopicData>(topicsData.map(t => ([t.id, t])))

        if(ArCabildoabiertoEmbedVisualization.isEleccion(spec)){
            this.electionSpec = spec
        } else {
            throw Error("Visualization should be election!")
        }
    }

    getCargosDistrito(nombre: string, cargo: Cargo): number | null {
        return this.cargosPorDistrito.get(`${nombre}:${cargo}`)
    }

    computeCargosPorDistrito() {
        ["Diputados", "Senadores"].forEach((cargo: Cargo) => {
            this.districts.forEach(district => {
                const cands = this.candidates
                    .filter(c => c.subcargo == "Titular" && c.alianza.distrito.nombre == district.nombre && c.cargo == cargo)

                const countAlianza = new Map<string, number>()

                cands.forEach(c => {
                    countAlianza.set(c.alianza.nombre, (countAlianza.get(c.alianza.nombre) ?? 0)+1)
                })

                const count = Math.max(...Array.from(countAlianza.values()), 0)
                this.cargosPorDistrito.set(`${district.nombre}:${cargo}`, count)
            })
        })
    }

    prepareForPlot(prev?: ElectionPlotter): {error?: string} {
        if(this.electionSpec.tipoDeEleccion != "Legislativa") {
            if(this.electionSpec.tipoDeEleccion == "") {
                return {error: "Elegí un tipo de elección."}
            } else {
                return {error: "Este tipo de elección todavía no está soportado."}
            }
        }

        if(this.electionSpec.region && this.electionSpec.region != "Nacional"){
            return {error: "Por ahora solo está soportada la región Nacional."}
        } else if(!this.electionSpec.region){
            return {error: "Elegí una región."}
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
            const distrito = getProvinceName(r[districtCol])
            const alianza: Alianza = {
                nombre: r[alianzaCol],
                idTema: r[idAlianzaCol],
                distrito: {
                    nombre: distrito,
                    idTema: r[idDistritoCol],
                }
            }
            const subcargo = getSubcargo(r[titularCol])
            const nombre = r[candidateCol]
            const cargo = getCargo(r[cargoCol])
            const candidato: Candidato = {
                nombre,
                posicion: r[positionCol] != null ? Number(r[positionCol]) : null,
                subcargo,
                alianza,
                cargo,
                idTema: r[idTemaCol]
            }
            this.candidates.push(candidato)
            this.nameToTopicId.set(alianza.nombre, alianza.idTema)
            this.nameToTopicId.set(nombre, candidato.idTema)
            this.nameToTopicId.set(
                alianza.distrito.nombre, alianza.distrito.idTema
            )
            this.districts.set(alianza.distrito.nombre, alianza.distrito)
        })

        this.computeCargosPorDistrito()

        this.candidates.forEach(c => {
            const topic = this.topicsData.get(c.idTema)
            if(topic) {
                c.foto = getStringProp("Foto", topic.props)
                c.antecedentesEstado = getStringListProp("Antecedentes en el Estado", topic.props)
                c.antecedentesProf = getStringListProp("Antecedentes profesionales", topic.props)
                c.antecedentesAcad = getStringListProp("Antecedentes académicos", topic.props)
                c.otrosDatos = getStringListProp("Otros datos", topic.props)
                c.patrimonio = getNumberProp("Patrimonio declarado USD", topic.props)
                c.espaciosPoliticosAnt = getStringListProp("Espacios políticos", topic.props)
                c.controversias = getStringListProp("Controversias", topic.props)
                c.replyCount = topic.repliesCount
            }
            const topicAlianza = this.topicsData.get(c.alianza.idTema)
            if(topicAlianza) {
                c.alianza.foto = getStringProp("Foto", topicAlianza.props)
                c.alianza.propuestas = getStringListProp("Propuestas", topicAlianza.props)
                c.alianza.partidos = getStringListProp("Partidos", topicAlianza.props)
                c.alianza.otrosDatos = getStringListProp("Otros datos", topicAlianza.props)
                c.alianza.replyCount = topicAlianza.repliesCount
            }
            const topicDistrito = this.topicsData.get(c.alianza.distrito.idTema)
            if(topicDistrito) {
                c.alianza.distrito.replyCount = topicDistrito.repliesCount
            }
            c.alianza.distrito = {
                ...c.alianza.distrito,
                cantSenadores: this.getCargosDistrito(c.alianza.distrito.nombre, "Senadores"),
                cantDiputados: this.getCargosDistrito(c.alianza.distrito.nombre, "Diputados")
            }

            this.districts.set(c.alianza.distrito.nombre, c.alianza.distrito)
        })

        return {}
    }

    getCandidatesForDistrict(p: string | null, cargo: Cargo) {
        if(!p) return null
        const pNorm = getProvinceName(p)

        const key = `${pNorm}:${cargo}`
        const cur = this.candidatesByDistrict.get(key)
        if(cur) return cur

        const m = new Map<string, [Candidato[], Candidato[]]>()

        this.candidates
            .filter(r => {
                return r.alianza.distrito.nombre == pNorm && r.cargo == cargo
            })
            .forEach(r => {
                const cur = m.get(r.alianza.nombre)

                if(r.subcargo == "Titular"){
                    if(!cur) m.set(r.alianza.nombre, [[r], []])
                    else cur[0].push(r)
                } else {
                    if(!cur) m.set(r.alianza.nombre, [[], [r]])
                    else cur[1].push(r)
                }
            })

        this.candidatesByDistrict.set(key, m)
        return m
    }

    getSearchResults(s: string): ElectionElement[] {
        s = cleanText(s)

        const results: ElectionElement[] = []
        this.candidates.forEach(r => {
            if(cleanText(r.nombre)?.includes(s)){
                results.push({
                    type: "candidato",
                    value: r
                })
            }
            if(cleanText(r.alianza.nombre)?.includes(s)){
                results.push({
                    type: "alianza",
                    value: r.alianza
                })
            }
            if(cleanText(r.alianza.distrito.nombre)?.includes(s)){
                results.push({
                    type: "distrito",
                    value: r.alianza.distrito
                })
            }
        })
        return unique(Array.from(results.values()), x => JSON.stringify(x))
    }

    getCandidatosAlianza(alianza: Alianza): [Candidato[], Candidato[]] {
        const candidatos = this.candidates
            .filter(r => {
                return r.alianza.nombre == alianza.nombre && r.alianza.distrito.nombre == alianza.distrito.nombre
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

    getDistrictsForAlianza(alianza: string): Distrito[] {
        return unique(this.candidates
            .filter(x => x.alianza.nombre == alianza)
            .map(r => r.alianza.distrito),
                x => x.nombre
        )
    }

    getDistrictTopicId(distrito: Distrito) {
        for(const x of this.candidates) {
            if(x.alianza.distrito.nombre == distrito.nombre) {
                return x.alianza.distrito.idTema
            }
        }
        return null
    }

    getAlianzaTopicId(alianza: Alianza) {
        for(const x of this.candidates) {
            if(x.alianza.nombre == alianza.nombre) {
                return x.alianza.idTema
            }
        }
        return null
    }

    getDistrict(province: string) {
        const name = getProvinceName(province)
        return this.districts.get(name)
    }

    countDataAvailable(nombre: string): number {
        const a = this.candidates.find(x => x.alianza.nombre == nombre)?.alianza
        if(!a) return 0
        const candidatos = this.getCandidatosAlianza(a)

        let res = count([
            a.partidos,
            a.foto,
            a.propuestas,
            a.otrosDatos,
            a.replyCount
        ], x => x != null)

        candidatos.forEach(r => {
            r.forEach(c => {
                res += count([
                    c.espaciosPoliticosAnt,
                    c.replyCount,
                    c.antecedentesProf,
                    c.antecedentesEstado,
                    c.antecedentesAcad,
                    c.foto,
                    c.patrimonio,
                    c.controversias,
                    c.otrosDatos
                ], x => x != null)
            })
        })

        return res
    }
}