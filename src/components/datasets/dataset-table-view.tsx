import {PrettyJSON} from "../../../modules/ui-utils/src/pretty-json";
import {DatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";


export type DatasetForTableView = Omit<DatasetView, "name" | "uri" | "cid" | "author" | "createdAt">


type DatasetTableViewProps = {
    dataset: DatasetForTableView, maxHeight?: number, maxWidth?: number
}


export const DatasetTableView = ({dataset, maxHeight = 600, maxWidth = 600}: DatasetTableViewProps) => {
    const rows = JSON.parse(dataset.data)
    const columns = dataset.columns

    return <div className={"w-full"}>
        <div
            className={"border-t mb-4 custom-scrollbar overflow-x-scroll overflow-y-scroll text-sm"}
            style={{maxHeight, maxWidth}}
        >

            <table className="table-auto w-full border-collapse border max-[1080px]:text-xs">
                <thead className="bg-[var(--background-dark2)]">
                <tr>
                    {columns.map((header, colIndex) => (
                        <th key={colIndex} className="border px-4 py-2 text-left">
                            {header.name}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {rows && rows.slice(0, 20).map((r, rowIndex) => (
                    <tr key={rowIndex} className="even:bg-[var(--background-dark)]">
                        {Object.values(r).map((cell: string, colIndex) => (
                            <td key={colIndex} className="border px-4 py-2">
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
            <div className={"text-base text-[var(--text-light)] py-2 ml-1"}>
                Se muestran solo las primeras 20 filas.
            </div>
        </div>
    </div>
}