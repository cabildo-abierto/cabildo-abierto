import {useEffect, useRef} from "react";
import {Network, Node as NetworkNode} from "vis-network";
import { useTheme } from "../theme/theme-context";


export default function Graph({ edgesList, nodeIds, onClickNode, nodeLabels }: {
    edgesList: {x: string, y: string}[]
    nodeIds: string[]
    onClickNode: (nodeId: string) => void
    nodeLabels?: Map<string, string>
}) {
    const networkRef = useRef<HTMLDivElement>(null)
    const {currentTheme} = useTheme()

    useEffect(() => {
        if (!networkRef.current) return;


        const nodes: NetworkNode[] = Array.from(nodeIds).map((id) => ({
            id,
            label: nodeLabels ? nodeLabels.get(id) : id,
            shape: "box",
            font: {
                color: currentTheme == "dark" ? "#fbfbfc" : "#1a1a1a",
                size: 16,
                vadjust: 0,
            },
            shapeProperties: {
                borderRadius: 5,
            },
            margin: {
                top: 15,
                right: 20,
                bottom: 15,
                left: 20,
            },
            borderWidth: 1,
            borderWidthSelected: 1,
            color: {
                background: currentTheme == "dark" ? "#181b23" : "#ffffff",
                border: currentTheme == "dark" ? "#fbfbfc" : "#1a1a1a",
                highlight: {
                    background: currentTheme == "dark" ? "#181b23" : "#ffffff",
                    border: currentTheme == "dark" ? "#fbfbfc" : "#1a1a1a",
                },
                hover: {
                    background: currentTheme == "dark" ? "#181b23" : "#ffffff",
                    border: currentTheme == "dark" ? "#fbfbfc" : "#1a1a1a",
                },
            },
        }));

        const edges = edgesList.map(({ x, y }) => ({ from: y, to: x }));

        const options = {
            physics: {
                enabled: true,
                solver: "repulsion",
            },
            layout: {
                randomSeed: 12345
            }
        };

        const network = new Network(networkRef.current, { nodes, edges }, options);


        network.on("click", (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0]
                onClickNode(nodeId)
            }
        });

        return () => network.destroy();
    }, [edgesList]);

    return <div
        ref={networkRef}
        style={{ height: "600px", width: "100%" }}
    />
}