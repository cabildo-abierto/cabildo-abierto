import {FilterProps} from "@/lib/types";
import SearchableDropdown from "../../../../modules/ui-utils/src/searchable-dropdown";
import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import RemoveIcon from "@mui/icons-material/Remove";
import {Select} from "../../../../modules/ui-utils/src/select";
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";


export const filterOptions = ["igual a", "distinto de", "uno de"]

export const FilterConfig = ({filter, updateFilter, dataset, onRemove}: {
    dataset?: DatasetView | DatasetViewBasic,
    filter: FilterProps,
    updateFilter: (f: FilterProps) => void,
    onRemove: () => void
}) => {
    return <div className={"flex items-center space-x-2"}>
        <SearchableDropdown
            options={dataset ? dataset.columns.map(c => c.name) : []}
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
            options={[] /* TO DO */}
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
            color={"background-dark"}
        >
            <RemoveIcon fontSize={"small"}/>
        </IconButton>
    </div>
}