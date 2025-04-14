"use client"
import { VisualizationProps } from "@/lib/definitions";
import { useEffect, useRef, useState } from "react";
import { useDataset } from "@/hooks/swr";
import { localizeDataset } from "../../../modules/ca-lexical-editor/src/nodes/visualization-node-comp";
import embed from "vega-embed";
import {useLayoutConfig} from "../layout/layout-config-context";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {pxToNumber} from "@/utils/strings";

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
        json.width = "container";
        json.height = "container";

        const widthNum = typeof width === "string" ? pxToNumber(width) : width;
        const baseFontSize = Math.floor(widthNum * 14 / 600)
        const smallFontSize = Math.floor(baseFontSize * 0.8)
        const largeFontSize = Math.floor(baseFontSize * 1.3)

        json = {
            ...json,
            title: {
                ...json.title,
                fontSize: largeFontSize,
            },
            config: {
                ...json.config,
                axis: {...json.config.axis, labelFontSize: smallFontSize, titleFontSize: baseFontSize},
                legend: {...json.config.legend, labelFontSize: smallFontSize, titleFontSize: baseFontSize},
                text: {...json.config.text, fontSize: smallFontSize}
            }
        };

        embed(
            containerRef.current,
            json,
            {
                actions: false,
            }
        )
            .then(() => setIsVegaLoading(false))
            .catch((err) => console.error("Vega Embed Error:", err));
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