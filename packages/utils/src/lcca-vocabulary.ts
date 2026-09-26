const keywordAliases: Record<string, string> = {
    SELECCIONAR: 'SELECT', DESDE: 'FROM', DONDE: 'WHERE', COMO: 'AS', Y: 'AND', O: 'OR', NO: 'NOT',
    NULO: 'NULL', VERDADERO: 'TRUE', FALSO: 'FALSE', ES: 'IS', EN: 'IN', ENTRE: 'BETWEEN',
    SIMILAR: 'LIKE', SIMILAR_SIN_MAYUSCULAS: 'ILIKE', DISTINTOS: 'DISTINCT', TODOS: 'ALL',
    UNIR: 'JOIN', INTERNA: 'INNER', IZQUIERDA: 'LEFT', DERECHA: 'RIGHT', COMPLETA: 'FULL',
    EXTERNA: 'OUTER', CRUZADA: 'CROSS', SOBRE: 'ON', USANDO: 'USING', AGRUPAR: 'GROUP', POR: 'BY',
    TENIENDO: 'HAVING', ORDENAR: 'ORDER', ASCENDENTE: 'ASC', DESCENDENTE: 'DESC', NULOS: 'NULLS',
    PRIMERO: 'FIRST', ULTIMO: 'LAST', LIMITE: 'LIMIT', DESPLAZAMIENTO: 'OFFSET', CON: 'WITH',
    UNION: 'UNION', INTERSECCION: 'INTERSECT', EXCEPTO: 'EXCEPT', CASO: 'CASE', CUANDO: 'WHEN',
    ENTONCES: 'THEN', SINO: 'ELSE', FIN: 'END', CONVERTIR: 'CAST', INTENTAR_CONVERTIR: 'TRY_CAST',
    FECHA: 'DATE', FECHA_HORA: 'TIMESTAMP', FECHA_HORA_ZONA: 'TIMESTAMPTZ', INTERVALO: 'INTERVAL',
    SOBRE_VENTANA: 'OVER', PARTICIONAR: 'PARTITION', FILAS: 'ROWS', RANGO: 'RANGE', ACTUAL: 'CURRENT',
    FILA: 'ROW', SIN_LIMITE: 'UNBOUNDED', ANTERIORES: 'PRECEDING', SIGUIENTES: 'FOLLOWING',
};
const functionAliases: Record<string, string> = {
    DATOS: 'dataset', SUMA: 'sum', PROMEDIO: 'avg', CONTAR: 'count', MINIMO: 'min', MAXIMO: 'max',
    MEDIANA: 'median', DESVIACION_ESTANDAR: 'stddev', VARIANZA: 'variance', ABSOLUTO: 'abs',
    REDONDEAR: 'round', PISO: 'floor', TECHO: 'ceil', RAIZ: 'sqrt', POTENCIA: 'pow',
    LOGARITMO_NATURAL: 'ln', LOGARITMO: 'log', EXPONENCIAL: 'exp', CONTIENE: 'contains',
    MINUSCULAS: 'lower', MAYUSCULAS: 'upper', RECORTAR: 'trim', LARGO: 'length', SUBCADENA: 'substring',
    CONCATENAR: 'concat', REEMPLAZAR: 'replace', EMPIEZA_CON: 'starts_with', TERMINA_CON: 'ends_with',
    COALESCER: 'coalesce', NULO_SI: 'nullif', MAYOR: 'greatest', MENOR: 'least', ANIO: 'year', ANO: 'year',
    MES: 'month', DIA: 'day', TRUNCAR_FECHA: 'date_trunc', PARTE_FECHA: 'date_part',
    FORMATEAR_FECHA: 'strftime', PARSEAR_FECHA: 'strptime', INTENTAR_PARSEAR_FECHA: 'try_strptime',
};
const englishKeywords = new Set(Object.values(keywordAliases));

export function lccaReservedWord(word: string): {kind: 'keyword' | 'function'; sql: string} | undefined {
    const key = word.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
    if (Object.hasOwn(keywordAliases, key)) return {kind: 'keyword', sql: keywordAliases[key]};
    if (Object.hasOwn(functionAliases, key)) return {kind: 'function', sql: functionAliases[key]};
    if (englishKeywords.has(word.toUpperCase())) return {kind: 'keyword', sql: word};
    return undefined;
}
