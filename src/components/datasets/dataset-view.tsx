import './index.css'

export const DatasetView = ({data, maxHeight="600px", maxWidth="600px"}: {
    data: any[], maxHeight?: string, maxWidth?: string}) => {
    const rows = data
    return <div className={"w-full"}>
        {rows != null && (
            <div className={"border-t mb-4 custom-scrollbar overflow-x-scroll overflow-y-scroll text-sm"}
                 style={{maxHeight, maxWidth}}>
                <table className="table-auto w-full border-collapse border">
                    <thead className="bg-[var(--background-dark2)]">
                    <tr>
                        {rows && Object.keys(rows[0]).map((header, colIndex) => (
                            <th key={colIndex} className="border px-4 py-2 text-left">
                                {header}
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
        )}
    </div>
}