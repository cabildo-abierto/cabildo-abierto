import React, {useEffect, useMemo, useState} from 'react';
import {Graph as VisxGraph} from '@visx/network';
import {Zoom} from '@visx/zoom';
import {
    forceSimulation,
    forceManyBody,
    forceLink,
    forceCenter
} from 'd3-force';
import {useTheme} from "@/components/layout/theme/theme-context";
import {TopicsGraph} from "@/lib/types";
import {bboxCollide} from "d3-bboxCollide"
import {useLayoutConfig} from "@/components/layout/main-layout/layout-config-context";
import {pxToNumber, inRange} from "@cabildo-abierto/utils";
import {MinusCircleIcon, PlusCircleIcon} from "@phosphor-icons/react";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";


type GraphNode = {
    id: string;
    x: number;
    y: number;
    data?: { categorySize?: number }
};

type GraphEdge = {
    source: GraphNode;
    target: GraphNode;
}

const Node = ({node, onClickNode, nodeWidth, nodeHeight, showText}: {
    node: GraphNode
    onClickNode: (id: string) => void
    nodeWidth: number
    nodeHeight: number
    showText: boolean
}) => {
    const categorySize = node?.data?.categorySize

    return <foreignObject
        x={-nodeWidth / 2}
        y={-nodeHeight / 2}
        width={nodeWidth}
        height={nodeHeight}
        requiredExtensions="http://www.w3.org/1999/xhtml"
    >
        <div
            onClick={() => {
                onClickNode(node.id)
            }}
            className={"cursor-pointer flex-col text-sm justify-center leading-tight p-1 bg-[var(--background-dark)] border-2 border-[var(--text)] flex items-center text-center w-full h-full " + (categorySize == undefined ? "rounded-lg" : "")}
        >
            {showText && <>
                <div
                    className={`text-wrap line-clamp-2 ${categorySize !== undefined ? "font-semibold" : ""}`}
                    style={{fontSize: 12}}
                >
                    {node.id}
                </div>
                {categorySize != undefined && <div className={"text-xs text-[var(--text-light)]"}>
                    {categorySize} {categorySize == 1 ? "tema" : "temas"}.
                </div>}
            </>}
        </div>
    </foreignObject>
}


const maxNodes = 500
const height = 600;
const nodeWidth = 160
const nodeHeight = 40


function useSimulateLayout(graph: TopicsGraph, width: number) {
    const nodeIds = graph.nodeIds
    const edgesList = graph.edges
    const centerX = width / 2;
    const centerY = height / 2;

    const nodesCount = Math.min(nodeIds.length, maxNodes)
    const radius = 10 * nodesCount / Math.PI
    const angleStep = (2 * Math.PI) / nodesCount

    const {nodes: initialNodes, edges: initialEdges} = useMemo(() => {
        const nodesData = graph.data ? new Map(graph.data.map(x => [x.id, x])) : undefined
        const initialNodes: GraphNode[] = nodeIds.slice(0, maxNodes).map((id, index) => ({
            id,
            x: centerX + radius * Math.cos(angleStep * index),
            y: centerY + radius * Math.sin(angleStep * index) * 1.5,
            data: nodesData ? nodesData.get(id) : undefined
        }));
        const nodesMap = new Map(initialNodes.map(n => [n.id, n]));

        const links: GraphEdge[] = edgesList
            .filter(e => nodesMap.has(e.x) && nodesMap.has(e.y))
            .map(({x, y}) => ({
                source: nodesMap.get(x),
                target: nodesMap.get(y),
            }))

        return {nodes: initialNodes, edges: links};
    }, [angleStep, centerX, centerY, edgesList, nodeIds, nodeWidth]);

    const [animatedNodes, setAnimatedNodes] = useState<GraphNode[]>([]);
    const [animatedEdges, setAnimatedEdges] = useState<GraphEdge[]>([]);

    useEffect(() => {
        setAnimatedNodes(initialNodes);
        setAnimatedEdges(initialEdges);

        const simulation = forceSimulation(initialNodes)
            .force("collide", bboxCollide([[-nodeWidth / 2 * 1.1, -nodeHeight / 2 * 1.1], [nodeWidth / 2 * 1.1, nodeHeight / 2 * 1.1]]))
            .force('center', forceCenter(width / 2, height / 2))
            .force('link', forceLink(initialEdges).id((d: any) => d.id).distance(100).strength(0.5))
            .force('charge', forceManyBody().strength(1000))
            .stop();

        let tickCount = 0;
        const maxTicks = 200;
        const ticksPerStep = 10;

        const interval = setInterval(() => {
            if (tickCount >= maxTicks) {
                clearInterval(interval);
                return;
            }

            simulation.tick(ticksPerStep);
            tickCount += ticksPerStep;

            setAnimatedNodes([...simulation.nodes()]);
            setAnimatedEdges([...initialEdges]); // edges don't change shape
        }, 5);

        return () => clearInterval(interval);
    }, [initialNodes, initialEdges]);

    return {nodes: animatedNodes, edges: animatedEdges}
}


export const GraphView = ({
                                      graph,
                                      onClickNode,
                                      title
                                  }: {
    graph: TopicsGraph
    title?: string
    onClickNode: (nodeId: string) => void;
}) => {
    const {currentTheme} = useTheme();
    const {layoutConfig} = useLayoutConfig()
    const nodeIds = graph.nodeIds

    const border = currentTheme === 'dark' ? '#fbfbfc' : '#1a1a1a';
    const dotColor = currentTheme === 'light' ? '#d7d7d7' : 'rgb(45, 45, 55)';
    const spacing = '20px';
    const dotSize = '1px';

    const width = pxToNumber(layoutConfig.centerWidth)

    const {edges: positionedEdges, nodes: positionedNodes} = useSimulateLayout(graph, width)

    return <div style={{width}}>
        <div
            style={{
                width: width,
                backgroundImage: `radial-gradient(${dotColor} ${dotSize}, transparent ${dotSize})`,
                backgroundSize: `${spacing} ${spacing}`,
            }}
            className="flex justify-center items-center select-none relative"
        >
            <Zoom<SVGSVGElement>
                width={width}
                height={height}
                scaleXMin={0.1}
                scaleXMax={10}
                scaleYMin={0.1}
                scaleYMax={10}
                initialTransformMatrix={{
                    scaleX: 1,
                    scaleY: 1,
                    translateX: 0,
                    translateY: 0,
                    skewX: 0,
                    skewY: 0,
                }}
            >
                {zoom => {
                    return <>
                        <svg
                            width={width}
                            height={height}
                            ref={zoom.containerRef}
                            style={{cursor: zoom.isDragging ? 'grabbing' : undefined, touchAction: "none"}}
                        >
                            <g transform={zoom.toString()}>
                                <VisxGraph<GraphEdge, GraphNode>
                                    graph={{nodes: positionedNodes, links: positionedEdges}}
                                    linkComponent={({link: {source, target}}) => (
                                        <line
                                            x1={source.x}
                                            y1={source.y}
                                            x2={target.x}
                                            y2={target.y}
                                            stroke={border}
                                            strokeWidth={1}
                                            strokeOpacity={0}
                                        />
                                    )}
                                    nodeComponent={({node}) => {
                                        const p = zoom.applyToPoint({x: node.x, y: node.y})
                                        const visible = inRange(p.x, -nodeWidth, width + nodeWidth) && inRange(p.y, -nodeHeight, height + nodeHeight)
                                        if (!visible) return null
                                        return <Node
                                            node={node}
                                            onClickNode={onClickNode}
                                            nodeWidth={nodeWidth}
                                            nodeHeight={nodeHeight}
                                            showText={zoom.transformMatrix.scaleX > 0.3}
                                        />
                                    }}
                                />
                            </g>
                        </svg>
                        <div className="absolute bottom-2 right-2 z-10 flex space-x-2">
                            <BaseIconButton
                                size={"small"}
                                className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                                onClick={() => zoom.scale({scaleX: 1.2, scaleY: 1.2})}
                            >
                                <PlusCircleIcon/>
                            </BaseIconButton>
                            <BaseIconButton
                                size={"small"}
                                onClick={() => zoom.scale({scaleX: 0.8, scaleY: 0.8})}
                            >
                                <MinusCircleIcon/>
                            </BaseIconButton>
                        </div>
                    </>
                }}
            </Zoom>
        </div>
        {nodeIds.length > maxNodes && <div className={"flex text-xs text-[var(--accent-dark)]"}>
            Se muestran {maxNodes} temas de {nodeIds.length}. Usá el buscador para filtrar.
        </div>}
    </div>
}
