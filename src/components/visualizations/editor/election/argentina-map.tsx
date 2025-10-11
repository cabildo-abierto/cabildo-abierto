import {getProvinceName} from "./election-plotter";
import React, {useEffect, useMemo, useState} from "react";
import {IconButton} from "@mui/material";
import {MinusCircleIcon, PlusCircleIcon} from "@phosphor-icons/react";
import {Mercator} from '@visx/geo';
import {Zoom} from '@visx/zoom';
import LoadingSpinner from "../../../layout/utils/loading-spinner";
import * as turf from '@turf/turf';
import {TransformMatrix} from "@visx/zoom/lib/types";
import {Group} from "@visx/group";

interface FeatureShape {
    type: 'Feature'
    id: string
    geometry: { coordinates: [number, number][][]; type: 'Polygon' }
    properties: { nombre: string }
}

export type GeoMercatorProps = {
    events?: boolean;
    onSelectProvince: (province: string) => void
    selectedProvince?: string
    height?: number
    width?: number
}

export const ArgentinaMap = ({
                                 events = false,
                                 selectedProvince,
                                 onSelectProvince,
                                 height,
                                 width
                             }: GeoMercatorProps) => {
    const [world, setWorld] = useState<{ type: 'FeatureCollection'; features: FeatureShape[] } | null>(null);
    const [hoveredProvince, setHoveredProvince] = useState(null)
    const initialScale = 550;
    const centerLong = -64.0;
    const centerLat = -40.0;

    useEffect(() => {
        fetch('/maps/provincias.geojson')
            .then((res) => res.json())
            .then((data) => {
                const cleanedFeatures = data.features.map((feature: FeatureShape) => {
                    try {
                        return turf.truncate(feature, {precision: 1, mutate: true});
                    } catch (err) {
                        console.warn(`Error processing feature ${feature.properties.nombre}:`, err);
                        return feature;
                    }
                });
                setWorld({type: 'FeatureCollection', features: cleanedFeatures});
            })
            .catch((err) => console.error('Error loading geojson:', err));
    }, []);

    if (!world) return <div><LoadingSpinner/></div>;

    if (width < 10) return null;

    const initialTransform: TransformMatrix = {
        scaleX: 1,
        scaleY: 1,
        translateX: 0,
        translateY: 0,
        skewX: 0,
        skewY: 0,
    }

    return (
        <div className="">
            <Zoom<SVGSVGElement>
                width={width}
                height={height}
                scaleXMin={0.5}
                scaleXMax={4}
                scaleYMin={1}
                scaleYMax={4}
                initialTransformMatrix={initialTransform}
            >
                {zoom => {

                    return <div className="relative w-full h-full">
                        <div className="absolute bottom-2 right-2 z-10 flex space-x-2">
                            <IconButton
                                size={"small"}
                                className="text-[var(--text)] p-2 rounded hover:text-[var(--text-light)]"
                                onClick={() => zoom.scale({scaleX: 1.2, scaleY: 1.2})}
                            >
                                <PlusCircleIcon/>
                            </IconButton>
                            <IconButton
                                size={"small"}
                                className="text-[var(--text)] p-2 rounded hover:text-[var(--text-light)]"
                                onClick={() => zoom.scale({scaleX: 0.8, scaleY: 0.8})}
                            >
                                <MinusCircleIcon/>
                            </IconButton>
                        </div>
                        <svg
                            width={width}
                            height={height}
                            className="border border-[var(--accent-dark)] touch-none"
                            ref={zoom.containerRef}
                            style={{cursor: zoom.isDragging ? 'grabbing' : ''}}
                        >
                            <Group
                                transform={zoom.toString()}
                            >
                                <Mercator<FeatureShape>
                                    data={world.features}
                                    scale={initialScale}
                                    translate={[width / 2, height / 2]}
                                    center={[centerLong, centerLat]}
                                >
                                    {(mercator) => (
                                        <g>
                                            {mercator.features.map(({feature, path}, i) => {
                                                const nombre = getProvinceName(feature.properties.nombre)

                                                const hovered = hoveredProvince && getProvinceName(hoveredProvince) == nombre
                                                const selected = selectedProvince && getProvinceName(selectedProvince) == nombre

                                                return (
                                                    <path
                                                        className={"cursor-pointer"}
                                                        key={`map-feature-${i}`}
                                                        d={path}
                                                        fill={hovered || selected ? "var(--text-light)" : "var(--text)"}
                                                        stroke={"var(--background)"}
                                                        strokeWidth={0.5 / zoom.transformMatrix.scaleX}
                                                        onClick={() => {
                                                            if (events) alert(`Clicked: ${feature.properties.nombre} (${feature.id})`)
                                                        }}
                                                        onMouseEnter={() => {
                                                            setHoveredProvince(nombre)
                                                        }}
                                                        onMouseLeave={() => {
                                                            if (hoveredProvince === nombre) setHoveredProvince(null)
                                                        }}
                                                        onMouseDown={() => {
                                                            onSelectProvince(nombre)
                                                        }}
                                                    />
                                                )
                                            })}
                                        </g>
                                    )}
                                </Mercator>
                            </Group>
                        </svg>
                    </div>
                }}
            </Zoom>
        </div>
    );
};


export const MemoizedArgentinaMap = ({selectedProvince, onSelectProvince, height, width}: {
    selectedProvince: string
    onSelectProvince: (v: string) => void
    height?: number
    width?: number
}) => {
    return useMemo(() => {
        return <ArgentinaMap
            selectedProvince={selectedProvince}
            onSelectProvince={onSelectProvince}
            height={height}
            width={width}
        />
    }, [selectedProvince, height])
}