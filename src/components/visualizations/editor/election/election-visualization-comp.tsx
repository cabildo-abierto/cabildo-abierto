import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {ElectionVisualization} from "@/components/visualizations/editor/election/election-visualization";
import {isDatasetView, isTopicsDatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {useEffect, useRef, useState} from "react";
import {TopicProp} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {visualizationViewToMain} from "@/components/writing/write-panel/write-post";
import {useQuery} from "@tanstack/react-query";
import {post} from "@/utils/fetch";
import LoadingSpinner from "@/components/layout/utils/loading-spinner";
import {PlotCaption, PlotTitle} from "@/components/visualizations/title";

type Props = {
    spec: $Typed<ArCabildoabiertoEmbedVisualization.Eleccion>
    visualization: ArCabildoabiertoEmbedVisualization.View
    maxWidth: number | undefined
    maxHeight: number | undefined
}


export type TopicData = {
    id: string
    props: TopicProp[]
    repliesCount: number
}

async function getElectionVisualizationTopicsData(v: ArCabildoabiertoEmbedVisualization.Main) {
    return (await post<{v: ArCabildoabiertoEmbedVisualization.Main}, TopicData[]>("/election", {v})).data
}

function useElectionVisualizationTopicsData(v: ArCabildoabiertoEmbedVisualization.Main) {
    return useQuery({
        queryKey: ["election", JSON.stringify(v)],
        queryFn: () => getElectionVisualizationTopicsData(v),
        enabled: true,
        select: (data) => data,
    })
}


const ElectionVisualizationComp = ({ spec, visualization }: Props) => {
    const {
        data: topicsData,
        isLoading: loadingTopicsData
    } = useElectionVisualizationTopicsData(visualizationViewToMain(visualization))
    const title = visualization.visualization.title
    const caption = visualization.visualization.caption
    const dataset = visualization.dataset

    const containerRef = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState<number>(0)

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                setWidth(entries[0].contentRect.width);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [])

    if (!isDatasetView(dataset) && !isTopicsDatasetView(dataset)) {
        return null
    }

    if(loadingTopicsData) {
        return <div ref={containerRef}>
            <LoadingSpinner/>
        </div>
    }

    return (
        <div className="flex flex-col space-y-2 bg-[var(--background)]" ref={containerRef}>
            {title && <PlotTitle title={title} fontSize={18}/>}
            <div className={"border border-[var(--accent-dark)]"}>
                {width > 0 ? <ElectionVisualization
                    spec={spec}
                    visualization={visualization}
                    dataset={dataset}
                    width={width}
                    height={500}
                    topicsData={topicsData}
                /> : <div><LoadingSpinner/></div>}
            </div>
            {caption && <PlotCaption caption={caption} />}
        </div>
    );
};


export default ElectionVisualizationComp