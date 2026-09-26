import {useMemo} from 'react';
import type {TypedTable, VisualizationSpecV1} from '@cabildo-abierto/api';
import {prepareVisualization, type VisualizationData} from '@cabildo-abierto/utils';

export type PreparedVisualization = {data?: VisualizationData; error?: string; empty: boolean};

export function usePreparedVisualization(spec: VisualizationSpecV1, table?: TypedTable, enabled = true): PreparedVisualization {
    const {chart, schemaVersion} = spec;
    return useMemo(() => {
        if (!enabled || !table) return {empty: false};
        try {
            const data = prepareVisualization({schemaVersion, chart}, table);
            const empty = data.kind === 'bar' ? !data.rows.some(row => row.values.some(value => value !== null))
                : data.kind === 'line' || data.kind === 'scatter' ? !data.series.some(series => series.points.some(point => point.y !== null))
                : !table.rows.length;
            return {data, empty};
        } catch (cause) {
            return {error: cause instanceof Error ? cause.message : 'No pudimos representar los datos.', empty: false};
        }
    }, [chart, schemaVersion, table, enabled]);
}
