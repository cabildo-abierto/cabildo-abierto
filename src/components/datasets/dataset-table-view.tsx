import {DatasetView, TopicsDatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {useState} from "react";


export type DatasetForTableView = Omit<DatasetView | TopicsDatasetView, "name" | "uri" | "cid" | "author" | "createdAt">


type DatasetTableViewProps = {
    dataset: DatasetForTableView, maxHeight?: number, maxWidth?: number
}


const CellContent = ({content}: {content: any}) => {
    if(typeof content == "string") {
        return content
    } else {
        return JSON.stringify(content)
    }
}


export const DatasetTableView = ({dataset, maxHeight, maxWidth}: DatasetTableViewProps) => {
    const rows = JSON.parse(dataset.data)
    const columns = dataset.columns
    const [showingRowsCount, setShowingRowsCount] = useState(20)

    if(rows.length == 0 || columns.length == 0) return <div className={"text-[var(--text-light)]"}>
        El conjunto de datos está vacío.
    </div>

    return <div
        className={"border-t mb-4 custom-scrollbar overflow-auto text-sm grow"}
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
            {rows && rows.slice(0, showingRowsCount).map((r, rowIndex) => (
                <tr key={rowIndex} className="even:bg-[var(--background-dark)]">
                    {Object.values(r).map((cell: any, colIndex) => (
                        <td key={colIndex} className="border px-4 py-2">
                            <CellContent content={cell}/>
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
        {showingRowsCount < rows.length && <div className={"text-base text-[var(--text-light)] py-2 ml-1"}>
            Se muestran las primeras {showingRowsCount} filas. <button onClick={() => {setShowingRowsCount(showingRowsCount+20)}} className={"text-[var(--primary)] hover:underline"}>Ver más</button>.
        </div>}
    </div>
}