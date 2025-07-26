import {PlotConfigProps} from "@/lib/types";
import SearchableDropdown from "../../../../modules/ui-utils/src/searchable-dropdown";
import {Select} from "../../../../modules/ui-utils/src/select";
import {DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {
    isColumnFilter,
    isDatasetDataSource,
    validateColumnFilter
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {produce} from "immer";
import {CloseButton} from "../../../../modules/ui-utils/src/close-button";
import {useCategories} from "@/queries/useTopics";


function operandViewToValue(op: string) {
    if (op == "≠") return "!="
    if (op == "en") return "in"
    if (op == "no en") return "notIn"
    if (op == "≥") return ">="
    if (op == "≤") return "<="
    if (op == "incluye") return "includes"
    return op
}


function operandToView(op: string) {
    if (op == "!=") return "≠"
    if (op == "in") return "en"
    if (op == "notIn") return "no en"
    if (op == ">=") return "≥"
    if (op == "<=") return "≤"
    if (op == "includes") return "incluye"
    return op
}


export const FilterConfig = ({config, setConfig, index, onRemove, dataset}: {
    config: PlotConfigProps
    setConfig?: (c: PlotConfigProps) => void
    index: number
    onRemove: () => void
    dataset?: DatasetViewBasic
}) => {
    const {data: categories} = useCategories()
    const filter = config.filters[index]


    if (isColumnFilter(filter)) {
        const isDatasetSource = isDatasetDataSource(config.dataSource)
        const columnOptions = dataset ? dataset.columns.map(c => c.name) : ["Categorías", "Título", "Sinónimos"]
        const isSingleOperand = !filter.operator || ["<=", "<", ">", ">=", "=", "!=", "includes"].includes(filter.operator)

        const valid = validateColumnFilter(filter)

        const selectedColumn = filter.column ?? (dataset ? dataset.columns[0].name : "")
        let valueOptions: string[] | "loading" = undefined
        if(selectedColumn == "Categorías" && categories){
            valueOptions = categories ?? "loading"
        }

        // TO DO: "=", "≠", ">", "<", "≥", "≤", "en", "no en"
        const operatorOptions = ["incluye"]

        return <div
            className={"flex space-x-2 justify-between items-center" + (!valid.success ? "border border-red-200" : "")}>
            <div className={"flex space-x-2 w-full"}>
                <div className={"flex-1"}>
                    <SearchableDropdown
                        options={columnOptions}
                        label={isDatasetSource ? "Columna" : "Propiedad"}
                        size={"small"}
                        fontSize={"12px"}
                        selected={selectedColumn}
                        onChange={(c: string) => {
                            setConfig(produce(config, draft => {
                                if (isColumnFilter(draft.filters[index])) {
                                    draft.filters[index].column = c
                                }
                            }))
                        }}
                    />
                </div>
                <div className={"min-w-20"}>
                    <Select
                        options={operatorOptions}
                        label={"Operador"}
                        value={operandToView(filter.operator) ?? "="}
                        fontSize={"12px"}
                        onChange={(v: string) => {
                            setConfig(produce(config, draft => {
                                if (isColumnFilter(draft.filters[index])) {
                                    draft.filters[index].operator = operandViewToValue(v)
                                }
                            }))
                        }}
                    />
                </div>
                <div className={"flex-1"}>
                    {isSingleOperand && <SearchableDropdown
                        label={"Valor"}
                        size={"small"}
                        fontSize={"12px"}
                        options={valueOptions}
                        selected={filter.operands && filter.operands.length > 0 ? filter.operands[0] : ""}
                        onChange={(e) => {
                            setConfig(produce(config, draft => {
                                if (isColumnFilter(draft.filters[index])) {
                                    draft.filters[index].operands = [e]
                                }
                            }))
                        }}
                    />}
                </div>
            </div>
            {setConfig && <CloseButton onClose={onRemove} size={"small"}/>}
        </div>
    }
}