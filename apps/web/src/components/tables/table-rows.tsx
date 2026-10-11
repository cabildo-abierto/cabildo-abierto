import {memo, type ReactNode} from 'react';
import {cn} from '@/lib/utils';

export const TableRows = memo(function TableRows({rows, cellClassName, renderCell}: {
    rows: ReactNode[][]; cellClassName: string; renderCell?: (cell: ReactNode, row: number, column: number) => ReactNode;
}) {
    return <tbody>{rows.map((row, index) => <tr key={index} className={cn('even:bg-muted/30')}>{row.map((cell, column) => <td key={column} className={cn(cellClassName, 'whitespace-pre-wrap')}>{renderCell ? renderCell(cell, index, column) : cell}</td>)}</tr>)}</tbody>;
});
