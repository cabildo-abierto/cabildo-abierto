"use client"
import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"
import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic"
import {LoadingSpinner} from "@/components/utils/base/loading-spinner"
import {AdminSection} from "./admin-section"
import dynamic from "next/dynamic"

const PlotFromVisualizationMain = dynamic(
    () => import("@/components/visualizations/editor/plot-from-visualization-main"),
    {ssr: false}
)

const TEST_TOPIC_IDS = [
    "Inflación",
    "Actividad económica",
    "Senado",
    "Elecciones legislativas nacionales 2025"
]

function TopicVisualizations({topicId}: {topicId: string}) {
    const {query, topic} = useTopicWithNormalizedContent(topicId)

    if (query.isLoading || topic === "loading") {
        return <div className="py-4">
            <LoadingSpinner/>
        </div>
    }

    if (!topic) {
        return <div className="text-[var(--text-light)] text-sm py-2">
            No se encontró el tema: {topicId}
        </div>
    }

    const visualizations = (topic.embeds ?? []).filter(
        embed => ArCabildoabiertoEmbedVisualization.isMain(embed.value)
    )

    if (visualizations.length === 0) {
        return <div className="text-[var(--text-light)] text-sm py-2">
            No hay visualizaciones en este tema.
        </div>
    }

    return <div className="space-y-4 flex flex-col items-center">
        {visualizations.map((embed, i) => {
            if (!ArCabildoabiertoEmbedVisualization.isMain(embed.value)) return null
            return <div key={i} className="border p-4 flex">
                <PlotFromVisualizationMain
                    visualization={embed.value}
                    width={600}
                />
            </div>
        })}
    </div>
}

export const AdminVisualizaciones = () => {
    return <div className="p-4 space-y-8">
        <div className="text-center text-sm text-[var(--text-light)]">
            Esta sección muestra visualizaciones de temas de prueba para verificar que funcionan correctamente.
        </div>
        {TEST_TOPIC_IDS.map(topicId => (
            <AdminSection key={topicId} title={topicId}>
                <TopicVisualizations topicId={topicId}/>
            </AdminSection>
        ))}
    </div>
}
