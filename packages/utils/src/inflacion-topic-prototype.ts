import {$Typed, ArCabildoabiertoEmbedPoll, ArCabildoabiertoWikiEmbed} from "@cabildo-abierto/api"

export type ConsensusStatus = "accepted" | "discussion" | "rejected"

export type Consensus = {
    title: string
    /** Texto plano en markdown (sin títulos `#`): párrafos, enlaces `[t](url)` y embeds por índice. */
    bodyMarkdown: string
    bodyEmbeds: ArCabildoabiertoWikiEmbed.View[]
    acceptVotes: number
    rejectVotes: number
    opinions: number
    status: ConsensusStatus
    /** Versiones publicadas de este consenso (incluye la vigente). */
    versionCount: number
}

/** Misma visualización por sectores que en el tema «Inflación» (dataset INDEC agregado en CA). */
const PROTOTYPE_IPC_POR_SECTOR_VIS: ArCabildoabiertoWikiEmbed.View["value"] = {
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
                $type: "ar.cabildoabierto.wiki.embed#view",
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

export type PrototypeTopicWikiExtras = {
    consensuses: Consensus[]
    polls: { poll: $Typed<ArCabildoabiertoEmbedPoll.View> }[]
    sources: TopicSourceMock[]
    opinions: OpinionThreadMock[]
}

export function inflacionArgentinaPrototypeExtras(): PrototypeTopicWikiExtras {
    return {
        consensuses: PROTOTYPE_INFLACION_ARGENTINA_CONSENSUS,
        polls: PROTOTYPE_TOPIC_POLLS,
        sources: PROTOTYPE_TOPIC_SOURCES,
        opinions: PROTOTYPE_TOPIC_OPINIONS,
    }
}
