import { VisualizationProps } from "../../app/lib/definitions";
import { useEffect, useRef, useState } from "react";
import { useDataset } from "../../hooks/contents";
import { localizeDataset } from "../editor/nodes/visualization-node-comp";
import "../editor/article-content.css";
import { VegaPlotPreview } from "./vega-plot-preview";
import embed from "vega-embed";
import { pxToNumber } from "../utils/utils";

export const VegaPlot = ({
                             visualization,
                             width
                         }: {
    visualization: VisualizationProps;
    width?: number | string;
    previewOnly?: boolean;
}) => {
    const [isVegaLoading, setIsVegaLoading] = useState(true);
    const { dataset } = useDataset(visualization.visualization.dataset.uri);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!dataset || !containerRef.current) return;

        let json = JSON.parse(visualization.visualization.spec);
        json = localizeDataset(json);
        json.data = { values: dataset.data };
        if(width){
            json.width = "container"
            json.height = "container"
        }

        embed(
            containerRef.current,
            json,
            {
                actions: false,
            }
        )
            .then(() => setIsVegaLoading(false))
            .catch((err) => console.error("Vega Embed Error:", err));
    }, [visualization, dataset, width]);

    return (
        <>
            {isVegaLoading &&
                <VegaPlotPreview
                    visualization={visualization}
                    width={width}
                    height={width ? pxToNumber(width)*0.55 : undefined}
                />
            }
            <div
                ref={containerRef}
                style={{ width, height: width ? pxToNumber(width)*0.55 : "auto"}}
                onClick={(e) => e.stopPropagation()}
            />
        </>
    );
};