import React, {useEffect, useMemo, useState} from 'react';
import {Graph as VisxGraph} from '@visx/network';
import {Zoom} from '@visx/zoom';
import {
    forceSimulation,
    forceManyBody,
    forceLink,
    forceCenter
} from 'd3-force';
import {useTheme} from "../theme/theme-context";
import {TopicsGraph} from "@/lib/types";
import {bboxCollide} from "d3-bboxCollide"
import {inRange} from "lodash-es";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {pxToNumber} from "@/utils/strings";

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
                style={{ fontSize: 12 }}
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

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
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

        return { nodes: initialNodes, edges: links };
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


/*function useLayout(graph: TopicsGraph, width: number) {
    const nodeIds = graph.nodeIds
    const edgesList = graph.edges
    const centerX = width / 2
    const centerY = height / 2

    const radius = Math.sqrt(50 * nodeIds.length / Math.PI)
    const angleStep = (2 * Math.PI) / Math.min(nodeIds.length, maxNodes)

    const { nodes, edges } = useMemo(() => {
        const nodesData: Map<string, GraphNode["data"]> = new Map()
        graph.data.forEach(n => {nodesData.set(n.id, n)})

        const links = edgesList
            .filter(e => nodesData.has(e.x) && nodesData.has(e.y))

        const graphologyGraph = new GraphologyGraph()
        nodeIds.forEach(n => {graphologyGraph.addNode(n)})
        links.forEach(link => graphologyGraph.addEdge(link.x, link.y))
        circular.assign(graphologyGraph, {scale: radius})
        forceAtlas2.assign(graphologyGraph, { iterations: 1000, settings: {adjustSizes: true, gravity: 10}})

        const positionedNodes: GraphNode[] = graphologyGraph.nodes().map(id => {
            const attrs = graphologyGraph.getNodeAttributes(id)
            return {
                id,
                x: attrs.x,
                y: attrs.y,
                data: nodesData.get(id)
            }
        })

        const nodesMap = new Map(positionedNodes.map(n => [n.id, n]))
        const positionedEdges: GraphEdge[] = links.map(l => ({
            source: nodesMap.get(l.x),
            target: nodesMap.get(l.y)
        }))

        return { nodes: positionedNodes, edges: positionedEdges };
    }, [angleStep, centerX, centerY, edgesList, nodeIds, nodeWidth]);

    return {nodes, edges}
}



function useELKLayout(graph: TopicsGraph, width: number) {
    const [positionedNodes, setPositionedNodes] = useState<{nodes: GraphNode[], edges: GraphEdge[]}>()

    const elk = new ELK();

    const nodeIds = graph.nodeIds;
    const edgesList = graph.edges;
    const nodesDataMap: Map<string, GraphNode["data"]> = new Map();
    graph.data?.forEach(n => nodesDataMap.set(n.id, n));

    const {elkGraph, edges} = useMemo(() => {
        const elkGraph = {
            id: 'root',
            layoutOptions: {
                'elk.algorithm': 'layered', // or 'mrtree' / 'force' depending on your layout needs
                'elk.spacing.nodeNode': '50',
                'elk.layered.spacing.nodeNodeBetweenLayers': '100'
            },
            children: nodeIds.map(id => ({
                id,
                width: nodeWidth, // Customize based on your actual node width
                height: nodeHeight  // Customize based on your actual node height
            })),
            edges: edgesList
                .filter(e => nodesDataMap.has(e.x) && nodesDataMap.has(e.y))
                .map(e => ({
                    id: `${e.x}->${e.y}`,
                    sources: [e.x],
                    targets: [e.y]
                }))
        };

        console.log("elk edges", elkGraph.edges)

        const edges = elkGraph.edges.map(({ sources, targets }) => ({
            source: sources[0],
            target: targets[0]
        }));

        console.log("edges", edges)

        return { elkGraph, edges };
    }, [graph, width, height]);

    useEffect(() => {
        async function updateLayout() {
            let pNodes: GraphNode[] = [];

            const layoutPromise = await elk.layout(elkGraph).then(layouted => {
                pNodes = layouted.children.map(node => ({
                    id: node.id,
                    x: node.x,
                    y: node.y,
                    data: nodesDataMap.get(node.id)
                }));
            })

            const nodesMap = new Map(pNodes.map(n => [n.id, n]))

            const pEdges: GraphEdge[] = []
            edges.forEach(e => {
                pEdges.push({
                    source: nodesMap.get(e.source),
                    target: nodesMap.get(e.target),
                })
            })

            setPositionedNodes({nodes: pNodes, edges: pEdges})
        }

        updateLayout()
    }, [graph])

    return { ...positionedNodes, isLoading: positionedNodes == null };
}*/


export default function GraphView({
                                  graph,
                                  onClickNode,
                                  title
                              }: {
    graph: TopicsGraph
    title?: string
    onClickNode: (nodeId: string) => void;
}) {
    const {currentTheme} = useTheme();
    const {layoutConfig, isMobile} = useLayoutConfig()
    const nodeIds = graph.nodeIds

    const border = currentTheme === 'dark' ? '#fbfbfc' : '#1a1a1a';
    const dotColor = currentTheme === 'light' ? '#d7d7d7' : 'rgb(45, 45, 55)';
    const spacing = '20px';
    const dotSize = '1px';

    const width = isMobile ? window.innerWidth : pxToNumber(layoutConfig.maxWidthCenter)

    const {edges: positionedEdges, nodes: positionedNodes} = useSimulateLayout(graph, width)

    return <div className={"relative"} style={{width: layoutConfig.maxWidthCenter}}>
        <div
            style={{
                width: width,
                backgroundImage: `radial-gradient(${dotColor} ${dotSize}, transparent ${dotSize})`,
                backgroundSize: `${spacing} ${spacing}`,
            }}
            className="flex justify-center items-center select-none"
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
                    return <svg
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
                                    const visible = inRange(p.x, -nodeWidth, width+nodeWidth) && inRange(p.y, -nodeHeight, height+nodeHeight)
                                    if(!visible) return null
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
                }}
            </Zoom>
        </div>
        {nodeIds.length > maxNodes && <div className={"flex justify-end text-xs text-[var(--text-lighter)]"}>
            Se muestran {maxNodes} temas de {nodeIds.length}.
        </div>}
    </div>
}
