import {OptionsDropdownButton} from "@/components/layout/options/options-dropdown-button";
import {DownloadIcon} from "@phosphor-icons/react";
import {DatasetForTableView} from "@/components/visualizations/datasets/dataset-table-view";

const escapeCsvValue = (value: any): string => {
    const stringValue = String(value ?? ''); // Handle null/undefined
    if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

function datasetToCsv(dataset: DatasetForTableView) {
    const header = dataset.columns
        .map(c => c.name)
        .map(escapeCsvValue)
        .join(',')

    const rows = JSON.parse(dataset.data).map(row => {
        return dataset.columns.map(col => escapeCsvValue(row[col.name])).join(',')
    })

    return [header, ...rows].join('\n')
}

export const OptionsDownloadDatasetButton = ({dataset, name}: {
    dataset: DatasetForTableView
    name?: string
}) => {

    async function onClickDownload() {
        const csv = datasetToCsv(dataset)
        const fileName = name ? `${name}.csv` : "datos.csv"

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url;
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()

        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        return {}
    }

    return <OptionsDropdownButton
        text1={"Descargar"}
        startIcon={<DownloadIcon/>}
        handleClick={onClickDownload}
    />
}