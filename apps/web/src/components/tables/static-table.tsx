import type {StaticTableContent} from '@cabildo-abierto/api';
import {RichTextRenderer} from '@/components/rich-text/rich-text-renderer';
import {TableFrame} from './table-frame';
import {cn} from '@/lib/utils';

export function StaticTable({value, footnoteNumbers, linksEnabled = true, refreshOnMount = true}: {
    value: StaticTableContent; footnoteNumbers?: ReadonlyMap<string, number>; linksEnabled?: boolean; refreshOnMount?: boolean;
}) {
    const cell = (content: string) => <div className={cn('rich-text-content min-w-0')}><RichTextRenderer content={content} linksEnabled={linksEnabled} footnoteNumbers={footnoteNumbers} refreshOnMount={refreshOnMount}/></div>;
    return <TableFrame equalColumns headers={value.showHeaders ? value.headers.map(cell) : undefined} rows={value.rows.map(row => row.map(cell))}/>;
}
