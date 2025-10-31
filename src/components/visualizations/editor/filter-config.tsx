import {PlotConfigProps} from "@/lib/types";
import BaseTextFieldWithSuggestions from "../../layout/base/base-text-field-with-suggestions";
import BaseSelect from "../../layout/base/base-select";
import {DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {produce} from "immer";
import {CloseButton} from "../../layout/utils/close-button";
import {useCategories} from "@/queries/getters/useTopics";
import {BaseFullscreenPopup} from "../../layout/base/base-fullscreen-popup";
import {useState} from "react";
import {BaseButton} from "../../layout/base/baseButton";
import {ListEditor} from "../../layout/utils/list-editor";
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import {BaseIconButton} from "@/components/layout/base/base-icon-button";


function operatorViewToValue(op: string) {
    if (op == "≠") return "!="
    if (op == "uno de") return "in"
    if (op == "no uno de") return "notIn"
    if (op == "≥") return ">="
    if (op == "≤") return "<="
    if (op == "incluye") return "includes"
    return op
}


function operatorToView(op: string) {
    if (op == "!=") return "≠"
    if (op == "in") return "uno de"
    if (op == "notIn") return "no uno de"
    if (op == ">=") return "≥"
    if (op == "<=") return "≤"
    if (op == "includes") return "incluye"
    return op
}


const OperandListEditor = ({
                               config,
                               setConfig,
                               filterIndex
                           }: {
    config: PlotConfigProps
    setConfig?: (c: PlotConfigProps) => void
    filterIndex: number
}) => {
    const [editing, setEditing] = useState(false)
    const filters = config.filters as PlotConfigProps["filters"]
    const f = filters[filterIndex]

    if (ArCabildoabiertoEmbedVisualization.isColumnFilter(f)) {
        const values = f.operands
        return <>
            {(!values || values.length == 0) && <div className={"text-[var(--text-light)] text-sm"}>
                <BaseIconButton
                    size={"small"}
                    onClick={() => {
                        setEditing(true)
                    }}
                >
                    <WriteButtonIcon/>
                </BaseIconButton>
            </div>}
            {values && values.length > 0 && <div
                className="px-1 py-[6px] cursor-pointer bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)]"
            >
                <span
                    className={"text-sm line-clamp-1 text-ellipsis"}
                    onClick={() => {
                        setEditing(true)
                    }}>
                    {values.join(", ")}
                </span>
            </div>}
            <BaseFullscreenPopup closeButton open={editing} onClose={() => {
                setEditing(false)
            }}>
                <div className={"flex flex-col items-center px-4 space-y-4 pb-4 sm:w-[400px]"}>
                    <h3 className={"uppercase text-sm"}>
                        Editar valores del filtro
                    </h3>
                    <div className={"text-[var(--text-light)]"}>
                        {f.column && f.column.length > 0 ? f.column : "Columna"} {operatorToView(f.operator)}...
                    </div>
                    <ListEditor
                        items={values ?? []}
                        setItems={(v: string[]) => {
                            setConfig(produce(config, draft => {
                                if (ArCabildoabiertoEmbedVisualization.isColumnFilter(draft.filters[filterIndex])) {
                                    draft.filters[filterIndex].operands = v
                                }
                            }))
                        }}
                    />
                    <div className={"flex w-full justify-end"}>
                        <BaseButton
                            onClick={() => {
                                setEditing(false)
                            }}
                            variant={"outlined"}
                            size={"small"}
                        >
                            Aceptar
                        </BaseButton>
                    </div>
                </div>
            </BaseFullscreenPopup>
        </>
    }

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


    if (ArCabildoabiertoEmbedVisualization.isColumnFilter(filter)) {
        const isDatasetSource = ArCabildoabiertoEmbedVisualization.isDatasetDataSource(config.dataSource)
        const columnOptions = dataset ? dataset.columns.map(c => c.name) : ["Categorías", "Título", "Sinónimos"]
        const isSingleOperand = !filter.operator || ["<=", "<", ">", ">=", "=", "!=", "includes"].includes(filter.operator)

        const selectedColumn = filter.column ?? ""
        let valueOptions: string[] | "loading" = undefined
        if (selectedColumn == "Categorías" && categories) {
            valueOptions = categories ?? "loading"
        }

        // TO DO: "≠", ">", "<", "≥", "≤", "en", "no en"
        const operatorOptions = ["=", "incluye", "en"]

        return <div
            className={"flex space-x-2 justify-between items-center"}
        >
            <div className={"flex space-x-2 items-center w-full"}>
                <div className={"flex-1"}>
                    <BaseTextFieldWithSuggestions
                        options={columnOptions}
                        placeholder={isDatasetSource ? "Columna" : "Propiedad"}
                        inputClassName={"text-[12px]"}
                        value={selectedColumn}
                        onChange={(c: string) => {
                            setConfig(produce(config, draft => {
                                if (ArCabildoabiertoEmbedVisualization.isColumnFilter(draft.filters[index])) {
                                    draft.filters[index].column = c
                                }
                            }))
                        }}
                    />
                </div>
                <div className={"min-w-20"}>
                    <BaseSelect
                        size={"small"}
                        contentClassName={"z-[1501] portal group"}
                        triggerClassName={"py-2"}
                        options={operatorOptions}
                        label={"Operador"}
                        value={operatorToView(filter.operator) ?? ""}
                        itemClassName={"text-[12px]"}
                        onChange={(v: string) => {
                            setConfig(produce(config, draft => {
                                if (ArCabildoabiertoEmbedVisualization.isColumnFilter(draft.filters[index])) {
                                    draft.filters[index].operator = operatorViewToValue(v)
                                }
                            }))
                        }}
                    />
                </div>
                <div className={"flex-1"}>
                    {isSingleOperand && <BaseTextFieldWithSuggestions
                        placeholder={"Valor"}
                        inputClassName={"text-[12px]"}
                        options={valueOptions}
                        value={filter.operands && filter.operands.length > 0 ? filter.operands[0] : ""}
                        onChange={(e) => {
                            setConfig(produce(config, draft => {
                                if (ArCabildoabiertoEmbedVisualization.isColumnFilter(draft.filters[index])) {
                                    draft.filters[index].operands = [e]
                                }
                            }))
                        }}
                    />}
                    {!isSingleOperand && <OperandListEditor
                        config={config}
                        setConfig={setConfig}
                        filterIndex={index}
                    />}
                </div>
            </div>
            {setConfig && <CloseButton onClose={onRemove} size={"small"}/>}
        </div>
    }
}