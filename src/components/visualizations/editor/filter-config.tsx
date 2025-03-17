import {DatasetProps, FilterProps, PlotConfigProps} from "../../../app/lib/definitions";
import SearchableDropdown from "../../ui-utils/searchable-dropdown";
import {IconButton} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import {Select} from "../../ui-utils/select";


export const filterOptions = ["igual a", "distinto de", "uno de"]

export const FilterConfig = ({filter, updateFilter, dataset, onRemove}: {
    dataset?: DatasetProps,
    filter: FilterProps,
    updateFilter: (f: FilterProps) => void,
    onRemove: () => void
}) => {
    return <div className={"flex items-center space-x-2"}>
        <SearchableDropdown
            options={dataset ? dataset.dataset.columns : []}
            label={"Columna"}
            size={"small"}
            fontSize={"14px"}
            selected={filter.column}
            onChange={(c: string) => {
                updateFilter({column: c, op: filter.op, value: filter.value})
            }}
        />
        <Select
            options={filterOptions}
            label={"Operador"}
            value={filter.op}
            fontSize={"14px"}
            onChange={(c: string) => {
                updateFilter({
                    op: c,
                    column: filter.column,
                    value: filter.value
                })
            }}
        />
        {<SearchableDropdown
            options={dataset && dataset.dataset && dataset.dataset.columnValues && filter.column && dataset.dataset.columns.includes(filter.column) && "get" in dataset.dataset.columnValues && dataset.dataset.columnValues.get(filter.column).length <= 8 ? dataset.dataset.columnValues.get(filter.column) : []}
            label={"Valor"}
            size={"small"}
            fontSize={"14px"}
            selected={filter.value}
            onChange={(c) => {
                updateFilter({
                    value: c,
                    column: filter.column,
                    op: filter.op
                })
            }}
        />}
        <IconButton
            size={"small"}
            onClick={onRemove}
        >
            <RemoveIcon fontSize={"small"}/>
        </IconButton>
    </div>
}