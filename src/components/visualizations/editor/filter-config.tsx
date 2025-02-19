import {DatasetProps, FilterProps, PlotConfigProps} from "../../../app/lib/definitions";
import SearchableDropdown from "../../ui-utils/searchable-dropdown";
import {IconButton} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";

export const FilterConfig = ({filter, updateFilter, config, dataset, onRemove}: {
    config: PlotConfigProps,
    dataset: { dataset?: DatasetProps },
    filter: FilterProps,
    updateFilter: (f: FilterProps) => void,
    onRemove: () => void
}) => {

    return <div className={"flex items-center space-x-2"}>
        <SearchableDropdown
            options={dataset.dataset ? dataset.dataset.dataset.columns : []}
            label={"Columna"}
            size={"small"}
            fontSize={"14px"}
            onSelect={(c: string) => {
                updateFilter({column: c, op: filter.op, value: filter.value})
            }}
        />
        <SearchableDropdown
            options={["igual a", "distinto de"]}
            label={"Operador"}
            size={"small"}
            fontSize={"14px"}
            onSelect={(c: "igual a" | "distinto de") => {
                updateFilter({
                    op: c,
                    column: filter.column,
                    value: filter.value
                })
            }}
        />
        <SearchableDropdown
            options={dataset && dataset.dataset.dataset.columnValues && filter.column && dataset.dataset.dataset.columnValues.get(filter.column).length <= 8 ? dataset.dataset.dataset.columnValues.get(filter.column) : []}
            label={"Valor"}
            size={"small"}
            fontSize={"14px"}
            onSelect={(c) => {
                updateFilter({
                    value: c,
                    column: filter.column,
                    op: filter.op
                })
            }}
        />
        <IconButton
            size={"small"}
            onClick={onRemove}
        >
            <RemoveIcon fontSize={"small"}/>
        </IconButton>
    </div>
}