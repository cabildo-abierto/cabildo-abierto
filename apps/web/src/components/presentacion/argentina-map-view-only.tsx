import React, {useEffect, useState} from "react";
import {Mercator} from '@visx/geo';
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import * as turf from '@turf/turf';
import {Group} from "@visx/group";

interface FeatureShape {
    type: 'Feature'
    id: string
    geometry: { coordinates: [number, number][][]; type: 'Polygon' }
    properties: { nombre: string }
}


export const ArgentinaMapViewOnly = ({width, height}: {
    width: number, height: number
}) => {
    const [world, setWorld] = useState<{ type: 'FeatureCollection'; features: FeatureShape[] } | null>(null);
    const initialScale = 500;
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

    return (
        <svg
            width={width}
            height={height}
            className="touch-none"
        >
            <Group
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
                                return (
                                    <path
                                        className={"cursor-pointer"}
                                        key={`map-feature-${i}`}
                                        d={path}
                                        fill={"transparent"}
                                        stroke={"var(--text)"}
                                        strokeWidth={1.5}
                                    />
                                )
                            })}
                        </g>
                    )}
                </Mercator>
            </Group>
        </svg>
    );
}