import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {ElectionMap} from "@/components/visualizations/editor/election/election-map";
import {isDatasetView, isTopicsDatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {useEffect, useRef, useState} from "react";

type Props = {
    spec: $Typed<ArCabildoabiertoEmbedVisualization.Eleccion>
    visualization: ArCabildoabiertoEmbedVisualization.View
    maxWidth: number | undefined
    maxHeight: number | undefined
}

const ElectionVisualizationComp = ({ spec, visualization }: Props) => {
    const title = visualization.visualization.title;
    const dataset = visualization.dataset;

    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                setWidth(entries[0].contentRect.width);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    if (!isDatasetView(dataset) && !isTopicsDatasetView(dataset)) {
        return null;
    }

    return (
        <div className="flex flex-col space-y-2" ref={containerRef}>
            {title && <div>
                <h3 className="text-center">{title}</h3>
            </div>}
            <div>
                {width > 0 && (
                    <ElectionMap
                        spec={spec}
                        visualization={visualization}
                        dataset={dataset}
                        width={width}
                        height={500}
                    />
                )}
            </div>
        </div>
    );
};


export default ElectionVisualizationComp