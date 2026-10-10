import type {TableValue, TypedTable} from "@cabildo-abierto/api";

export function lccaScalarResult(table: TypedTable): {value: TableValue; error: null} | {value: null; error: string} {
    if (table.columns.length !== 1 || table.rows.length !== 1 || table.rows[0].length !== 1) {
        return {value: null, error: "La consulta debe devolver exactamente una fila y una columna."};
    }
    return {value: table.rows[0][0], error: null};
}

export function formatLccaValue(value: TableValue): string {
    if (value === null) return "Sin dato";
    if (typeof value === "boolean") return value ? "Sí" : "No";
    if (typeof value === "number") return new Intl.NumberFormat("es-AR", {maximumSignificantDigits: 21}).format(value);
    return value;
}
