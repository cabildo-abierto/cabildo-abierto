export function datasetError(error:unknown){
    const code=error && typeof error==='object' && 'code' in error ? String(error.code) : '';
    if(code==='ERR_ENCODING_INVALID_ENCODED_DATA')return 'El CSV debe estar codificado en UTF-8.';
    if(code.startsWith('CSV_'))return 'El CSV tiene filas inconsistentes o una estructura inválida.';
    return (error instanceof Error?error.message:'No pudimos procesar el dataset.')
        .replace(/https?:\/\/[^\s'"<>]+/g,'[fuente remota]');
}
