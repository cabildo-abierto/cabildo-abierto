export function DatasetDimensions({rowCount, columnCount}: {rowCount?: number; columnCount: number}) {
    return <span>
        {rowCount === undefined ? "Filas no disponibles" : `${rowCount.toLocaleString("es-AR")} ${rowCount === 1 ? "fila" : "filas"}`}
        {" · "}{columnCount.toLocaleString("es-AR")} {columnCount === 1 ? "columna" : "columnas"}
    </span>;
}
