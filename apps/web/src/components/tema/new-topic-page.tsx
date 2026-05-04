"use client"

import dynamic from "next/dynamic"
import {useMemo, useState, type ReactNode} from "react"
import {$Typed} from "@atproto/api"
import {ArCabildoabiertoEmbedPoll, ArCabildoabiertoFeedArticle} from "@cabildo-abierto/api"
import {
    ArrowFatDownIcon,
    ArrowFatUpIcon,
    CheckIcon,
    PencilSimpleIcon,
    PlusIcon,
    XIcon,
} from "@phosphor-icons/react"
import {Poll} from "@/components/writing/poll/poll"
import {getEditorSettings} from "@/components/writing/settings"
import {InactiveCommentIcon} from "@/components/utils/icons/inactive-comment-icon"
import {useTopicPageParams} from "@/components/tema/use-topic-page-params"
import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic"
import {cn} from "@/lib/utils"
import {useLayoutConfig} from "@/components/layout/main-layout/layout-config-context"
import {BaseButton} from "@/components/utils/base/base-button";
import {TopicPropsPanel} from "@/components/tema/props/topic-props-panel";
import {TopicHeader} from "@/components/tema/view/topic-header";

const CAEditor = dynamic(
    () => import("@/components/editor/ca-editor").then((m) => m.CAEditor),
    {ssr: false},
)

export type ConsensusStatus = "accepted" | "discussion" | "rejected"

export type Consensus = {
    title: string
    /** Texto plano en markdown (sin títulos `#`): párrafos, enlaces `[t](url)` y embeds por índice. */
    bodyMarkdown: string
    bodyEmbeds: ArCabildoabiertoWikiEmbed.EmbedView[]
    acceptVotes: number
    rejectVotes: number
    opinions: number
    status: ConsensusStatus
    /** Versiones publicadas de este consenso (incluye la vigente). */
    versionCount: number
}

/** Misma visualización por sectores que en el tema «Inflación» (dataset INDEC agregado en CA). */
const PROTOTYPE_IPC_POR_SECTOR_VIS: ArCabildoabiertoWikiEmbed.EmbedView["value"] = {
    $type: "ar.cabildoabierto.embed.visualization",
    caption: "Inflación (IPC) por sectores a nivel nacional (2016 a junio 2025)",
    dataSource: {
        $type: "ar.cabildoabierto.embed.visualization#datasetDataSource",
        dataset: "at://did:plc:2356xofv4ntrbu42xeilxjnb/ar.cabildoabierto.data.dataset/3lwpjjcpv662v",
    },
    spec: {
        $type: "ar.cabildoabierto.embed.visualization#twoAxisPlot",
        dimensions: {
            marginBottom: 91,
            marginLeft: 79,
            xLabelFontSize: 18,
            xLabelOffset: 38,
            xTickLabelsAngle: 37,
            xTickLabelsFontSize: 12,
            yLabelFontSize: 18,
            yLabelOffset: 49,
            yTickLabelsFontSize: 12,
        },
        plot: {$type: "ar.cabildoabierto.embed.visualization#lines"},
        xAxis: "indice_tiempo",
        xLabel: "Tiempo",
        yAxes: [
            {
                $type: "ar.cabildoabierto.embed.visualization#axisConfig",
                column: "ipc_alimentos_bebidas_no_alcoholicas_nacional"
            },
            {
                $type: "ar.cabildoabierto.embed.visualization#axisConfig",
                column: "ipc_bebidas_alcoholicas_tabaco_nacional"
            },
            {$type: "ar.cabildoabierto.embed.visualization#axisConfig", column: "ipc_salud_nacional"},
            {$type: "ar.cabildoabierto.embed.visualization#axisConfig", column: "ipc_transporte_nacional"},
            {$type: "ar.cabildoabierto.embed.visualization#axisConfig", column: "ipc_prendas_vestir_calzado_nacional"},
            {
                $type: "ar.cabildoabierto.embed.visualization#axisConfig",
                column: "ipc_equipamiento_mantenimientos_hogar_nacional"
            },
            {$type: "ar.cabildoabierto.embed.visualization#axisConfig", column: "ipc_restaurantes_hoteles_nacional"},
            {$type: "ar.cabildoabierto.embed.visualization#axisConfig", column: "ipc_educacion_nacional"},
            {$type: "ar.cabildoabierto.embed.visualization#axisConfig", column: "ipc_recreacion_cultura_nacional"},
            {$type: "ar.cabildoabierto.embed.visualization#axisConfig", column: "ipc_comunicaciones_nacional"},
            {
                $type: "ar.cabildoabierto.embed.visualization#axisConfig",
                column: "ipc_vivienda_agua_electricidad_combustibles_nacional"
            },
        ],
        yLabel: "IPC (100 = diciembre de 2016)",
    },
    title: "",
}

const MD_IPC_SECTOR_BEFORE_CHART =
    "La inflación «general» no es un relevamiento único: el INDEC estima variaciones en divisiones (alimentos, transporte, vivienda y servicios, etc.) y luego las combina en un índice nacional usando ponderadores que salen de la encuesta de gastos de los hogares. Por eso el mismo número de inflación puede convivir con historias muy distintas según el rubro.\n\n" +
    "Antes de discutir magnitudes agregadas suele ayudar mirar trayectorias por sector. En el gráfico, cada serie indexa el nivel de precios de ese rubro con base diciembre de 2016 = 100: valores por encima de 100 indican acumulado de precios relativos a esa base.\n\n"

const MD_IPC_SECTOR_AFTER_CHART =
    "\n\nCuando un componente con peso en la canasta —por ejemplo servicios regulados o energía— acelera, puede empujar el índice aunque otros segmentos vayan más despacio. También se discute cuán representativas siguen siendo las ponderaciones si el patrón de consumo cambió fuerte respecto del último relevamiento de hogares: no siempre implica «medición incorrecta», pero sí distancia entre IPC promedio y experiencia de hogares particulares.\n\n" +
    "En síntesis: el agregado resume un promedio ponderado; el desglose muestra dónde se concentra la dinámica y por qué dos personas pueden «sentir» inflaciones distintas sin que ninguna esté «equivocada» en su lectura vivida."

function consensusIpcPorSector(): Consensus {
    const bodyMarkdown = MD_IPC_SECTOR_BEFORE_CHART + MD_IPC_SECTOR_AFTER_CHART
    return {
        title: "IPC por sector: por qué el agregado esconde trayectorias distintas",
        bodyMarkdown,
        bodyEmbeds: [
            {
                $type: "ar.cabildoabierto.feed.article#articleEmbedView",
                index: MD_IPC_SECTOR_BEFORE_CHART.length,
                value: PROTOTYPE_IPC_POR_SECTOR_VIS,
            },
        ],
        acceptVotes: 104,
        rejectVotes: 12,
        opinions: 58,
        status: "accepted",
        versionCount: 5,
    }
}

/** Datos ficticios para prototipo de consensos (tema «Inflación en Argentina»). */
export const PROTOTYPE_INFLACION_ARGENTINA_CONSENSUS: Consensus[] = [
    {
        title: "Últimas cifras oficiales y lectura del IPC",
        bodyMarkdown:
            "El INDEC difunde mensualmente la variación del Índice de Precios al Consumidor (IPC) a nivel país y desagregado por regiones y divisiones. Es la referencia habitual para paritarias, contratos indexados, metas explícitas o implícitas de política y para comparar Argentina con otros países siempre que se comparen indicadores conceptualmente parecidos.\n\n" +
            "Un alza mensual baja no implica automáticamente desinflación «estable»: puede haber base estadística, efectos estacionales o reversión de meses previos. Para contextualizar suele mirarse también la tasa interanual y, cuando hay volatilidad, medias móviles o núcleos (cuando existen series auxiliares).\n\n" +
            "Metodología, ponderadores y calendario de publicación están documentados en el [sitio del INDEC](https://www.indec.gob.ar/). Para este tema conviene citar fecha de publicación y período de referencia cuando se comparte un número en redes: evita que el consenso quede desactualizado en capturas sueltas.",
        bodyEmbeds: [],
        acceptVotes: 142,
        rejectVotes: 8,
        opinions: 23,
        status: "accepted",
        versionCount: 3,
    },
    consensusIpcPorSector(),
    {
        title: "Inflación núcleo vs. componentes regulados",
        bodyMarkdown:
            "Gran parte del debate distingue entre segmentos donde los precios se forman con más libertad de mercado y segmentos con fuerte intervención (tarifas, energía, algunos alimentos con acuerdos, etc.). No es una frontera perfecta, pero sirve para separar presiones vinculadas a costos indexados o decisiones de política de precios relativos de otras presiones.\n\n" +
            "Un consenso operativo es explicitar qué parte del movimiento del IPC refleja shocks de precios relativos (por ejemplo un salto tarifario) y qué parte es más difusa (demanda nominal, expectativas, tipo de cambio). Mezclar todo en un solo titular suele generar discusiones que hablan de «la inflación» pero no del canal por el cual suben los precios.\n\n" +
            "Los regulados no son «externos» a la macro: financiamiento, déficit y tipo de cambio pueden condicionar tarifas y subsidios. La separación es una herramienta analítica, no una causalidad única.",
        bodyEmbeds: [],
        acceptVotes: 98,
        rejectVotes: 31,
        opinions: 67,
        status: "discussion",
        versionCount: 7,
    },
    {
        title: "Emisión, déficit y financiamiento: presiones recurrentes en la discusión argentina",
        bodyMarkdown:
            "En economía y en la prensa económica suele discutirse la relación entre necesidades de financiamiento del Tesoro, el rol del banco central y la dinámica nominal (tipo de cambio, demanda agregada, expectativas). En Argentina, episodios de alta inflación aparecen asociados históricamente a tensiones fiscales y monetarias, aunque el peso relativo varía por período.\n\n" +
            "No todos los meses de alta inflación se explican igual: a veces predominan saltos de precios relativos, a veces devaluaciones, a veces indexación amplia. El consenso razonable es evitar reduccionismos: la pregunta empírica es cuánto aporta cada canal en la ventana que se está discutiendo.\n\n" +
            "Cuando alguien atribuye la inflación a un solo factor «siempre», conviene pedir identificación (qué evidencia, qué contrafactual, qué horizonte temporal). Esto mejora la calidad del intercambio sin negar que el canal fiscal-monetario suele estar en la mesa en la Argentina contemporánea.",
        bodyEmbeds: [],
        acceptVotes: 76,
        rejectVotes: 52,
        opinions: 104,
        status: "discussion",
        versionCount: 2,
    },
    {
        title: "Brecha cambiaria, tipo de cambio múltiple y expectativas",
        bodyMarkdown:
            "Cuando conviven más de un precio del dólar o hay restricciones al mercado de cambios, suele medirse una brecha entre cotizaciones. Esa brecha acompaña, en muchos episodios, expectativas de devaluación y mecanismos de indexación en contratos y listas de precios.\n\n" +
            "El Relevamiento de Expectativas de Mercado (REM) del BCRA es una fuente sistemática de medianas de inflación y tipo de cambio esperados. No es un oráculo: refleja lo que responden agentes consultados; sirve para anclar discusiones con una foto periódica y compararla con realizaciones. Más información en [bcra.gob.ar](https://www.bcra.gob.ar/).\n\n" +
            "Expectativas pueden desanclarse, y la brecha puede moverse por reglas cambiarias además de expectativas puras. En el tema conviene separar hecho estadístico (hay brecha) de narrativa causal (por qué existe), que suele ser más disputada.",
        bodyEmbeds: [],
        acceptVotes: 111,
        rejectVotes: 14,
        opinions: 41,
        status: "accepted",
        versionCount: 4,
    },
    {
        title: "Efectos distributivos: quién pierde primero con inflación alta",
        bodyMarkdown:
            "Hay amplio acuerdo descriptivo de que la inflación elevada erosiona más rápido a quienes no pueden reajustar ingresos al ritmo del índice: parte de asalariados sin paritarias ágiles, trabajadores informales, jubilados y hogares que dependen de transferencias fijas o actualizaciones rezagadas.\n\n" +
            "Además, el IPC es un promedio: hogares con canastas distintas (más transporte, más alquiler, más medicamentos) pueden ubicarse por encima o por debajo de la inflación promedio. Esto explica tensiones políticas incluso cuando el número «oficial» baja.\n\n" +
            "La discusión fuerte pasa por magnitudes, políticas de protección social, y cómo medir pobreza e indigencia con precios que cambian rápido. El consenso inicial es casi solo orientación: inflación alta suele ser regresiva en el corto plazo si no hay indexación generalizada.",
        bodyEmbeds: [],
        acceptVotes: 128,
        rejectVotes: 6,
        opinions: 38,
        status: "accepted",
        versionCount: 1,
    },
    {
        title: "Comparaciones internacionales: metodología antes que titulares",
        bodyMarkdown:
            "Comparar «la inflación de Argentina» con «la de otro país» usando solo una cifra sacada de un ranking suele ser engañoso: cambian bases, frecuencias, cobertura geográfica y definiciones de índice.\n\n" +
            "Conviene usar indicadores homogéneos (IPC con definiciones parecidas, o deflactores nacionales explícitos) y mirar horizontes (interanual, trimestral anualizado) en lugar de un solo mes. Para una vista regional orientativa se puede consultar tablas como [inflación por país en América](https://es.tradingeconomics.com/country-list/inflation-rate?continent=america).\n\n" +
            "Muchos países de la región reportan inflaciones menores que las argentinas recientes, pero el contraste útil es con país + método + período, no con un número aislado. Este consenso apunta a higiene estadística en el debate público.",
        bodyEmbeds: [],
        acceptVotes: 89,
        rejectVotes: 19,
        opinions: 29,
        status: "accepted",
        versionCount: 6,
    },
    {
        title: "Importaciones, tipo de cambio y passthrough a precios locales",
        bodyMarkdown:
            "Argentina importa energía, insumos, bienes intermedios y bienes de capital. Movimientos del tipo de cambio y precios internacionales pueden trasladarse a precios locales con rezagos y con intensidad sectorial distinta.\n\n" +
            "El passthrough depende de estructura de mercado, contratos, competencia, stocks y política comercial. Por eso no basta con «multiplicar el dólar por algo» para explicar toda la dinámica del IPC.\n\n" +
            "Este bloque suele usarse para distinguir inflación importada (costos externos) de otros factores domésticos. La distinción es útil siempre que no se convierta en una negación de interacciones: lo externo y lo interno suelen co-determinar el resultado.",
        bodyEmbeds: [],
        acceptVotes: 61,
        rejectVotes: 44,
        opinions: 55,
        status: "discussion",
        versionCount: 8,
    },
    {
        title: "La inflación reciente se explica casi solo por «especulación» de precios",
        bodyMarkdown:
            "Atribuir la dinámica del IPC principalmente a conductas especulativas de comercios o industrias, sin distinguir costos, expectativas, tipo de cambio, tarifas y política macro, suele considerarse un marco demasiado estrecho para analizar el fenómeno en Argentina.\n\n" +
            "Eso no niega que en mercados concentrados existan márgenes y conductas discutibles; el punto es que el consenso metodológico pide identificar canales y evidencia, no una etiqueta única.",
        bodyEmbeds: [],
        acceptVotes: 22,
        rejectVotes: 118,
        opinions: 91,
        status: "rejected",
        versionCount: 2,
    },
    {
        title: "Dolarizar de un día para el otro elimina la inflación sin trade-offs relevantes",
        bodyMarkdown:
            "Propuestas que presentan la dolarización como una solución inmediata y sin costos de transición, sin riesgos de balance o sin discusión fiscal suele encontrar objeciones fuertes en debates técnicos: el régimen cambiario es una variable entre muchas, y los cambios de ancla tienen historia de costos distributivos y riesgos financieros.\n\n" +
            "El rechazo acá es sobre el relato simplificado, no necesariamente sobre cada diseño institucional posible.",
        bodyEmbeds: [],
        acceptVotes: 14,
        rejectVotes: 131,
        opinions: 76,
        status: "rejected",
        versionCount: 4,
    },
    {
        title: "El IPC oficial siempre subestima la inflación «real» en el mismo factor fijo",
        bodyMarkdown:
            "Sostener un subregistro sistemático y constante del IPC respecto de una «inflación real» única para todos los hogares mezcla críticas metodológicas válidas (ponderadores, canasta, cobertura) con teorías no falsables.\n\n" +
            "La discusión seria apunta a encuesta de hogares, actualización de ponderadores, segmentación regional y sensibilidades: no a un factor oculto estable en el tiempo.",
        bodyEmbeds: [],
        acceptVotes: 19,
        rejectVotes: 103,
        opinions: 48,
        status: "rejected",
        versionCount: 1,
    },
]

type ConsensusTab = ConsensusStatus

const TAB_CONFIG: { id: ConsensusTab; label: string }[] = [
    {id: "accepted", label: "Aceptados"},
    {id: "discussion", label: "En discusión"},
    {id: "rejected", label: "Rechazados"},
]

const PROTOTYPE_TOPIC_POLLS: { poll: $Typed<ArCabildoabiertoEmbedPoll.View> }[] = [
    {
        poll: {
            $type: "ar.cabildoabierto.embed.poll#view",
            key: "proto-inflacion-expectativas",
            poll: {
                $type: "ar.cabildoabierto.embed.poll#poll",
                description: "¿Creés que la inflación interanual va a ser menor dentro de doce meses que hoy?",
                choices: [
                    {$type: "ar.cabildoabierto.embed.poll#pollChoice", label: "Sí"},
                    {$type: "ar.cabildoabierto.embed.poll#pollChoice", label: "No"},
                    {$type: "ar.cabildoabierto.embed.poll#pollChoice", label: "Depende mucho del escenario político"},
                ],
            },
            votes: [118, 94, 203],
        },
    },
    {
        poll: {
            $type: "ar.cabildoabierto.embed.poll#view",
            key: "proto-inflacion-factor",
            poll: {
                $type: "ar.cabildoabierto.embed.poll#poll",
                description: "En el último año, ¿qué factor te parece que más presionó los precios al consumidor?",
                choices: [
                    {$type: "ar.cabildoabierto.embed.poll#pollChoice", label: "Emisión / asistencia al Tesoro"},
                    {$type: "ar.cabildoabierto.embed.poll#pollChoice", label: "Tipo de cambio y passthrough"},
                    {$type: "ar.cabildoabierto.embed.poll#pollChoice", label: "Tarifas y precios regulados"},
                    {$type: "ar.cabildoabierto.embed.poll#pollChoice", label: "No tengo una lectura clara"},
                ],
            },
            votes: [87, 156, 72, 41],
        },
    },
]

type TopicSourceMock = {
    id: string
    kind: "document" | "dataset" | "link"
    title: string
    subtitle?: string
    url?: string
    acceptVotes: number
    rejectVotes: number
    /** Opiniones que mencionan esta fuente (prototipo). */
    opinionMentions: number
}

const PROTOTYPE_TOPIC_SOURCES: TopicSourceMock[] = [
    {
        id: "src-1",
        kind: "link",
        title: "Índice de precios al consumidor — INDEC",
        subtitle: "Series y comunicados de prensa oficiales",
        url: "https://www.indec.gob.ar/",
        acceptVotes: 192,
        rejectVotes: 22,
        opinionMentions: 41,
    },
    {
        id: "src-2",
        kind: "dataset",
        title: "REM — Expectativas de mercado (BCRA)",
        subtitle: "Mediana de inflación y TC esperados",
        url: "https://www.bcra.gob.ar/",
        acceptVotes: 138,
        rejectVotes: 18,
        opinionMentions: 28,
    },
    {
        id: "src-3",
        kind: "document",
        title: "Documento de trabajo: passthrough cambiario",
        subtitle: "PDF en repositorio académico (mock)",
        acceptVotes: 36,
        rejectVotes: 12,
        opinionMentions: 9,
    },
    {
        id: "src-4",
        kind: "link",
        title: "Comparación de canastas IPC vs. privados",
        subtitle: "Nota metodológica (mock)",
        url: "https://example.org/canastas",
        acceptVotes: 48,
        rejectVotes: 14,
        opinionMentions: 15,
    },
    {
        id: "src-5",
        kind: "dataset",
        title: "Salarios e índices por sector",
        subtitle: "Tabulados para gráficos del tema",
        acceptVotes: 24,
        rejectVotes: 9,
        opinionMentions: 7,
    },
    {
        id: "src-6",
        kind: "document",
        title: "Ley de Presupuesto — anexo macro",
        subtitle: "Referencias de déficit y financiamiento",
        acceptVotes: 72,
        rejectVotes: 19,
        opinionMentions: 12,
    },
]

type OpinionThreadMock = {
    id: string
    author: string
    at: string
    body: string
    upvotes: number
    downvotes: number
    children?: OpinionThreadMock[]
}

const PROTOTYPE_TOPIC_OPINIONS: OpinionThreadMock[] = [
    {
        id: "op-1",
        author: "maria.d",
        at: "hace 2 h",
        body: "El REM no es «la verdad», pero es la foto más sistemática de expectativas que tenemos mes a mes. Para el tema conviene linkear siempre el último PDF además del titular.",
        upvotes: 14,
        downvotes: 2,
        children: [
            {
                id: "op-1a",
                author: "lucas.k",
                at: "hace 1 h",
                body: "Coincido en el uso del REM; el problema es cuando se mezcla con expectativas implícitas en el TC sin decir el supuesto. ¿Agregamos una nota al pie en la ficha del tema?",
                upvotes: 6,
                downvotes: 3,
                children: [
                    {
                        id: "op-1a1",
                        author: "maria.d",
                        at: "hace 40 min",
                        body: "Sí, un párrafo corto en la ficha alcanza. Lo redacto y lo propongo como edición.",
                        upvotes: 4,
                        downvotes: 0,
                    },
                ],
            },
        ],
    },
    {
        id: "op-2",
        author: "javier.p",
        at: "hace 5 h",
        body: "Separaría más explícitamente «inflación de costos importados» de «devaluación passthrough». En la práctica se confunden en los titulares y acá deberíamos ser precisos.",
        upvotes: 9,
        downvotes: 4,
        children: [
            {
                id: "op-2a",
                author: "ana.r",
                at: "hace 3 h",
                body: "De acuerdo. Propongo un consenso hijo solo con definiciones operativas, sin entrar en magnitudes.",
                upvotes: 3,
                downvotes: 3,
            },
        ],
    },
    {
        id: "op-3",
        author: "sofia.m",
        at: "ayer",
        body: "Para activistas: si comparten el tema afuera, conviene fijar un consenso «aceptado» con el dato del IPC y la fecha del último dato, así no queda desactualizado el preview.",
        upvotes: 11,
        downvotes: 1,
    },
]

function isInflacionArgentinaTopic(topic: { id: string; props?: unknown }): boolean {
    return topic.id == "Inflación"
}

function countByStatus(items: Consensus[], status: ConsensusStatus): number {
    return items.filter((c) => c.status === status).length
}

function consensusPositivePercent(acceptVotes: number, rejectVotes: number): number | null {
    const total = acceptVotes + rejectVotes
    if (total === 0) return null
    return Math.round((acceptVotes / total) * 100)
}

/** Alineado a umbrales de prototipo: ≥80 % aceptado, ≤20 % rechazado, intermedio en discusión. */
function consensusPositivePercentClass(pct: number): string {
    if (pct >= 80) return "text-[var(--green-dark)]"
    if (pct <= 20) return "text-[var(--red-dark)]"
    return "text-[var(--yellow-dark)]"
}

function formatOpinionNetScore(upvotes: number, downvotes: number): string {
    const net = upvotes - downvotes
    if (net > 0) return `+${net}`
    return String(net)
}

/** Porcentaje + votos a favor/en contra + menciones (misma línea; íconos Check / X como en votación de versión). */
const ValidationVotesRow = ({
                                acceptVotes,
                                rejectVotes,
                                mentionCount,
                                checkXSize,
                                commentIconSize,
                                className,
                            }: {
    acceptVotes: number
    rejectVotes: number
    mentionCount: number
    checkXSize: number
    commentIconSize: number
    className?: string
}) => {
    const posPct = consensusPositivePercent(acceptVotes, rejectVotes)
    return (
        <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1", className)}>
            {posPct != null ? (
                <span className={cn("shrink-0 font-semibold tabular-nums", consensusPositivePercentClass(posPct))}>
                    {posPct}%
                </span>
            ) : (
                <span className={"shrink-0 text-xs text-[var(--text-light)]"}>Sin votos aún</span>
            )}
            <span className={"inline-flex shrink-0 items-center gap-1.5 tabular-nums text-[var(--text)]"}>
                <CheckIcon
                    size={checkXSize}
                    weight={"regular"}
                    aria-hidden
                    className={"shrink-0 text-[var(--text-light)]"}
                />
                <span className={"font-semibold"}>{acceptVotes}</span>
            </span>
            <span className={"inline-flex shrink-0 items-center gap-1.5 tabular-nums text-[var(--text)]"}>
                <XIcon
                    size={checkXSize}
                    weight={"regular"}
                    aria-hidden
                    className={"shrink-0 text-[var(--text-light)]"}
                />
                <span className={"font-semibold"}>{rejectVotes}</span>
            </span>
            <span className={"inline-flex shrink-0 items-center gap-1.5 text-[var(--text-light)]"}>
                <InactiveCommentIcon fontSize={commentIconSize}/>
                <span className={"font-semibold tabular-nums text-[var(--text)]"}>{mentionCount}</span>
            </span>
        </div>
    )
}

function kindLabel(kind: TopicSourceMock["kind"]): string {
    if (kind === "document") return "Documento"
    if (kind === "dataset") return "Dataset"
    return "Enlace"
}

const ConsensusReadOnlyEditor = ({
                                     consensus,
                                 }: {
    consensus: Pick<Consensus, "title" | "bodyMarkdown" | "bodyEmbeds">
}) => {
    const settings = useMemo(
        () =>
            getEditorSettings({
                isReadOnly: true,
                initialText: consensus.bodyMarkdown,
                initialTextFormat: "markdown",
                embeds: consensus.bodyEmbeds,
                allowComments: false,
                tableOfContents: false,
                showToolbar: false,
                isDraggableBlock: false,
                shouldPreserveNewLines: true,
                markdownShortcuts: false,
                topicMentions: false,
                title: consensus.title,
                editorClassName:
                    "relative article-content not-article-content min-h-[72px] mt-1 max-w-none text-[15px] leading-relaxed [&_.ContentEditable__root]:text-[var(--text-light)]",
                placeholderClassName: "hidden",
            }),
        [consensus.title, consensus.bodyMarkdown, consensus.bodyEmbeds],
    )

    return (
        <div className={"min-w-0"}>
            <CAEditor settings={settings} setEditor={() => {
            }} setEditorState={() => {
            }}/>
        </div>
    )
}


const NewTopicSectionButton = ({
                                   children,
                                   ariaLabel,
                               }: {
    children: ReactNode
    ariaLabel: string
}) => {
    return (
        <BaseButton variant="default" size={"default"} className={"normal-case text-[var(--text-light)] hover:text-[var(--text)]"} aria-label={ariaLabel} onClick={() => {
        }}>
            <PlusIcon aria-hidden className={""}/>
            {children}
        </BaseButton>
    )
}

function consensusVersionCountLabel(count: number): string {
    return count === 1 ? "1 versión" : `${count} versiones`
}


const Consensus = ({c}: {c: Consensus}) => {
    return (
        <div
            className={
                "group -mx-1 flex flex-col rounded-lg bg-transparent px-4 py-3 transition-[background-color,box-shadow] duration-150 ease-out hover:bg-[var(--background-sdark)] hover:shadow-sm focus-within:bg-[var(--background-sdark)] focus-within:shadow-sm"
            }
        >
            <h3
                className={
                    "text-xl font-semibold leading-snug tracking-tight text-[var(--text-light)] transition-colors duration-150 sm:text-2xl group-hover:text-[var(--text)] group-focus-within:text-[var(--text)]"
                }
            >
                {c.title}
            </h3>
            <div className={"min-w-0 mt-2"}>
                <ConsensusReadOnlyEditor consensus={c} />
            </div>
            <div
                className={
                    "mt-3 text-sm text-[var(--text-light)] opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
                }
            >
                <div
                    className={
                        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    }
                >
                    <div className={"min-w-0 flex-1"}>
                        <ValidationVotesRow
                            acceptVotes={c.acceptVotes}
                            rejectVotes={c.rejectVotes}
                            mentionCount={c.opinions}
                            checkXSize={20}
                            commentIconSize={20}
                        />
                    </div>
                    <div
                        className={
                            "flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1"
                        }
                    >
                        <span
                            className={
                                "text-xs font-medium tabular-nums text-[var(--text-light)]"
                            }
                        >
                            {consensusVersionCountLabel(c.versionCount)}
                        </span>
                        <BaseButton
                            variant={"default"}
                            aria-label={"Proponer una nueva versión de este consenso (prototipo)"}
                            className={
                                "inline-flex normal-case text-[var(--text-light)] hover:text-[var(--text)] items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium leading-tight transition-colors hover:bg-[var(--background-dark2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                            }
                            onClick={() => {}}
                        >
                            <PencilSimpleIcon
                                size={12}
                                weight={"regular"}
                                aria-hidden
                                className={"shrink-0 "}
                            />
                            Proponer modificación
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>
    )
}


const ConsensusList = () => {
    const {topicId, did, rkey} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)

    const [activeTab, setActiveTab] = useState<ConsensusTab>("accepted")

    const consensus: Consensus[] = useMemo(() => {
        if (!topic || topic === "loading") return []
        return isInflacionArgentinaTopic(topic) ? PROTOTYPE_INFLACION_ARGENTINA_CONSENSUS : []
    }, [topic])

    const filtered = useMemo(
        () => consensus.filter((c) => c.status === activeTab),
        [consensus, activeTab],
    )

    return (
        consensus.length > 0 && (
            <div className={"space-y-6"}>
                <div className={"flex justify-between items-center"}>
                <div
                    className={"flex flex-wrap gap-4"}
                    role={"tablist"}
                    aria-label={"Filtrar consensos por estado"}
                >
                    {TAB_CONFIG.map((tab) => {
                        const count = countByStatus(consensus, tab.id)
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                type={"button"}
                                role={"tab"}
                                aria-selected={isActive}
                                id={`consensus-tab-${tab.id}`}
                                aria-controls={`consensus-panel-${tab.id}`}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,box-shadow,color] duration-150 ease-out",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                                    isActive
                                        ? "bg-[var(--background-sdark)] text-[var(--text)] shadow-sm"
                                        : "bg-transparent text-[var(--text-light)] hover:bg-[var(--background-sdark)] hover:text-[var(--text)] hover:shadow-sm",
                                )}
                            >
                                {tab.label}
                                <span
                                    className={cn(
                                        "text-xs font-semibold tabular-nums",
                                        isActive ? "text-[var(--text)]/75" : "text-[var(--text-light)]/70",
                                    )}
                                >
                                    {count}
                                </span>
                            </button>
                        )
                    })}
                </div>
                <div className={"flex flex-wrap items-center justify-end gap-3"}>
                    <NewTopicSectionButton ariaLabel={"Proponer consenso (prototipo)"}>
                        Proponer un consenso
                    </NewTopicSectionButton>
                </div>
                </div>
                <div
                    role={"tabpanel"}
                    id={`consensus-panel-${activeTab}`}
                    aria-labelledby={`consensus-tab-${activeTab}`}
                    className={"space-y-4"}
                >
                    {filtered.length === 0 ? (
                        <p className={"text-sm text-[var(--text-light)]"}>
                            No hay consensos en esta categoría (prototipo).
                        </p>
                    ) : (
                        <div className={"space-y-4"}>
                            {filtered.map((c, index) => {
                                return <Consensus
                                    c={c}
                                    key={`${c.title}-${index}`}
                                />
                            })}
                        </div>
                    )}
                </div>
            </div>
        )
    )
}

const Polls = () => {
    const {topicId, did, rkey} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)

    const polls = useMemo(() => {
        if (!topic || topic === "loading") return []
        return isInflacionArgentinaTopic(topic) ? PROTOTYPE_TOPIC_POLLS : []
    }, [topic])

    if (polls.length === 0) return null

    return (
        <div className={"space-y-4"}>
            <div className={"flex flex-wrap items-center justify-end gap-3"}>
                <NewTopicSectionButton ariaLabel={"Crear encuesta (prototipo)"}>
                    Crear encuesta
                </NewTopicSectionButton>
            </div>
            <div className={"space-y-4"}>
                {polls.map(({poll}) => (
                    <Poll key={poll.key} poll={poll} onSelectOption={() => {}}/>
                ))}
            </div>
        </div>
    )
}

const SourceCard = ({source}: { source: TopicSourceMock }) => {
    return (
        <div
            className={
                "flex flex-col gap-2 rounded-lg bg-[var(--background-sdark)] p-4"
            }
        >
            <div className={"text-[11px] font-semibold uppercase tracking-wide text-[var(--text-light)]"}>
                {kindLabel(source.kind)}
            </div>
            <div className={"text-[15px] font-medium leading-snug text-[var(--text)]"}>{source.title}</div>
            {source.subtitle ? (
                <div className={"text-sm leading-snug text-[var(--text-light)]"}>{source.subtitle}</div>
            ) : null}
            {source.url ? (
                <a
                    href={source.url}
                    target={"_blank"}
                    rel={"noopener noreferrer"}
                    className={"truncate text-sm text-[var(--text)] underline-offset-2 hover:underline"}
                >
                    {source.url}
                </a>
            ) : null}
            <div
                className={
                    "mt-auto pt-2 text-xs text-[var(--text-light)] sm:text-sm"
                }
            >
                <ValidationVotesRow
                    acceptVotes={source.acceptVotes}
                    rejectVotes={source.rejectVotes}
                    mentionCount={source.opinionMentions}
                    checkXSize={14}
                    commentIconSize={16}
                />
            </div>
        </div>
    )
}

const Sources = () => {
    const {topicId, did, rkey} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)

    const sources = useMemo(() => {
        if (!topic || topic === "loading") return []
        return isInflacionArgentinaTopic(topic) ? PROTOTYPE_TOPIC_SOURCES : []
    }, [topic])

    if (sources.length === 0) return null

    return (
        <div className={"space-y-4"}>
            <div className={"flex flex-wrap items-center justify-end gap-3"}>
                <NewTopicSectionButton ariaLabel={"Agregar fuente (prototipo)"}>
                    Agregar una fuente
                </NewTopicSectionButton>
            </div>
            <div
                className={
                    "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
                }
            >
                {sources.map((s) => (
                    <SourceCard key={s.id} source={s}/>
                ))}
            </div>
        </div>
    )
}

const OpinionBranch = ({node}: { node: OpinionThreadMock }) => {
    return (
        <div>
            <div className={"rounded-lg bg-[var(--background-sdark)] p-4"}>
                <div className={"mb-2 flex flex-wrap items-baseline justify-between gap-2"}>
                    <span className={"font-medium text-[var(--text)]"}>{node.author}</span>
                    <span className={"text-xs text-[var(--text-light)]"}>{node.at}</span>
                </div>
                <p className={"whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--text)]"}>{node.body}</p>
                <div
                    className={
                        "mt-3 flex items-center gap-1 pt-3"
                    }
                >
                    <button
                        type={"button"}
                        className={
                            "rounded-md p-1.5 text-[var(--text-light)] transition-colors hover:bg-[var(--background-dark2)]"
                        }
                        aria-label={"Votar a favor"}
                        onClick={() => {
                        }}
                    >
                        <ArrowFatUpIcon size={20} weight={"regular"} aria-hidden/>
                    </button>
                    <span
                        className={
                            "min-w-[2.25rem] text-center text-sm font-semibold tabular-nums text-[var(--text)]"
                        }
                    >
                        {formatOpinionNetScore(node.upvotes, node.downvotes)}
                    </span>
                    <button
                        type={"button"}
                        className={
                            "rounded-md p-1.5 text-[var(--text-light)] transition-colors hover:bg-[var(--background-dark2)]"
                        }
                        aria-label={"Votar en contra"}
                        onClick={() => {
                        }}
                    >
                        <ArrowFatDownIcon size={20} weight={"regular"} aria-hidden/>
                    </button>
                </div>
            </div>
            {node.children?.length ? (
                <div
                    className={
                        "relative mt-4 space-y-5 border-l-2 border-[var(--background-dark2)] pl-4"
                    }
                >
                    {node.children.map((ch) => (
                        <OpinionBranch key={ch.id} node={ch}/>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

const Opinions = () => {
    const {topicId, did, rkey} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)

    const roots = useMemo(() => {
        if (!topic || topic === "loading") return []
        return isInflacionArgentinaTopic(topic) ? PROTOTYPE_TOPIC_OPINIONS : []
    }, [topic])

    if (roots.length === 0) return null

    return (
        <div className={"space-y-4"}>
            <div className={"flex flex-wrap items-center justify-end gap-3"}>
                <NewTopicSectionButton ariaLabel={"Publicar opinión (prototipo)"}>
                    Nueva opinión
                </NewTopicSectionButton>
            </div>
            <div className={"space-y-6"}>
                {roots.map((n) => (
                    <OpinionBranch key={n.id} node={n}/>
                ))}
            </div>
        </div>
    )
}

export const NewTopicPage = () => {
    const {topicId, did, rkey} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)
    const {isMobile, layoutConfig} = useLayoutConfig()

    if (!topic || topic === "loading") return null

    return (
        <div className={cn("relative space-y-8 pb-32", isMobile && "pt-6")}>
            <div
                className={
                    "absolute top-14 right-2 z-[200] flex flex-col items-end space-y-2"
                }
            >
                <TopicPropsPanel topic={topic}/>
            </div>
            <div
                className={cn(
                    "mx-auto flex w-full max-w-[1200px] flex-col gap-10",
                    isMobile ? "px-4" : (!layoutConfig.spaceForRightSide ? "pr-4 " : ""), !layoutConfig.spaceForLeftSide && "pl-4",
                )}
            >
                <TopicHeader topic={topic}/>
                <ConsensusList/>
                <Polls/>
                <Sources/>
                <Opinions/>
            </div>
        </div>
    )
}
