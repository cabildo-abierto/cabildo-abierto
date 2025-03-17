"use client"
import { VisualizationProps } from "../../app/lib/definitions";
import { useEffect, useRef, useState } from "react";
import { useDataset } from "../../hooks/contents";
import { localizeDataset } from "../editor/nodes/visualization-node-comp";
import "../editor/article-content.css";
import embed from "vega-embed";
import {useLayoutConfig} from "../layout/layout-config-context";
import LoadingSpinner from "../ui-utils/loading-spinner";
import {pxToNumber} from "../utils/strings";

export const VegaPlot = ({
     visualization,
     width="600px"
 }: {
    visualization: VisualizationProps;
    width?: number | string;
    previewOnly?: boolean;
}) => {
    const [isVegaLoading, setIsVegaLoading] = useState(true);
    const { dataset } = useDataset(visualization.visualization.dataset.uri);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const {layoutConfig} = useLayoutConfig()

    useEffect(() => {
        if (!dataset || !containerRef.current) return;

        let json = JSON.parse(visualization.visualization.spec);
        json = localizeDataset(json);
        json.data = { values: dataset.data };
        json.width = "container"
        json.height = "container"

        embed(
            containerRef.current,
            json,
            {
                actions: false,
            }
        )
        .then(() => setIsVegaLoading(false))
        .catch((err) => console.error("Vega Embed Error:", err))
    }, [visualization, dataset, width, layoutConfig]);

    return (
        <div
            style={{width: width ? width : "100%", height: width ? pxToNumber(width) * 0.55 : "auto"}}
        >
            {isVegaLoading &&
                <LoadingSpinner/>
            }

            <div
                ref={containerRef}
                style={{width: width ? width : "100%", height: width ? pxToNumber(width) * 0.55 : "auto"}}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};