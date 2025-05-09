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

    const background = currentTheme == "dark" ? "rgb(30, 30, 40)" : "rgb(255, 255, 240)"
    const border = currentTheme == "dark" ? "#fbfbfc" : "#1a1a1a"
    const textColor = currentTheme == "dark" ? "#fbfbfc" : "#1a1a1a"

    useEffect(() => {
        if (!networkRef.current) return;


        const nodes: NetworkNode[] = Array.from(nodeIds).map((id) => ({
            id,
            label: nodeLabels ? nodeLabels.get(id) : id,
            shape: "box",
            font: {
                color: textColor,
                size: 24,
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
                background: background,
                border: border,
                highlight: {
                    background: background,
                    border: border,
                },
                hover: {
                    background: background,
                    border: border,
                },
            },
        }));

        const edges = edgesList.map(({x, y}) => ({from: y, to: x}));

        const options = {
            physics: {
                enabled: true,
                solver: "repulsion",
                repulsion: {
                    centralGravity: 0.1,
                    springLength: 90,
                    springConstant: 0.01, // Lower = softer springs
                    nodeDistance: 90,    // Minimum distance between nodes
                    damping: 0.15         // Reduces bounciness
                }
            },
            layout: {
                randomSeed: 12345
            }
        };

        const network = new Network(networkRef.current, {nodes, edges}, options);


        network.on("click", (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0]
                onClickNode(nodeId)
            }
        });

        return () => network.destroy();
    }, [edgesList]);

    const dotColor = currentTheme == "light" ? "#d7d7d7" : "rgb(45, 45, 55)";
    const spacing = "20px";
    const dotSize = "1px";

    return (
        <div
            ref={networkRef}
            style={{
                height: "600px",
                width: "100%",
                backgroundImage: `radial-gradient(${dotColor} ${dotSize}, transparent ${dotSize})`,
                backgroundSize: `${spacing} ${spacing}`,
            }}
        />
    );
}