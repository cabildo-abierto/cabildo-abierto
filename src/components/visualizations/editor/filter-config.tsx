import {PlotConfigProps} from "@/lib/types";
import SearchableDropdown from "../../../../modules/ui-utils/src/searchable-dropdown";
import {Select} from "../../../../modules/ui-utils/src/select";
import {DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {produce} from "immer";
import {CloseButton} from "../../../../modules/ui-utils/src/close-button";
import {useCategories} from "@/queries/useTopics";
import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {useState} from "react";
import {Button, darker} from "../../../../modules/ui-utils/src/button";
import {ListEditor} from "../../../../modules/ui-utils/src/list-editor";
import {Box, IconButton} from "@mui/material";
import {WriteButtonIcon} from "@/components/icons/write-button-icon";
import {Color} from "../../../../modules/ui-utils/src/color";


function operatorViewToValue(op: string) {
    if (op == "≠") return "!="
    if (op == "en") return "in"
    if (op == "no en") return "notIn"
    if (op == "≥") return ">="
    if (op == "≤") return "<="
    if (op == "incluye") return "includes"
    return op
}


function operatorToView(op: string) {
    if (op == "!=") return "≠"
    if (op == "in") return "en"
    if (op == "notIn") return "no en"
    if (op == ">=") return "≥"
    if (op == "<=") return "≤"
    if (op == "includes") return "incluye"
    return op
}


const OperandListEditor = ({
                               config,
                               setConfig,
                               filterIndex,
                               baseColor = "background-dark"
                           }: {
    config: PlotConfigProps
    setConfig?: (c: PlotConfigProps) => void
    filterIndex: number
    baseColor?: Color
}) => {
    const [editing, setEditing] = useState(false)
    const filters = config.filters as PlotConfigProps["filters"]
    const f = filters[filterIndex]

    if (ArCabildoabiertoEmbedVisualization.isColumnFilter(f)) {
        const values = f.operands ? f.operands.filter(x => x.length > 0) : null
        return <>
            {(!values || values.length == 0) && <div className={"text-[var(--text-light)] text-sm"}><IconButton
                size={"small"}
                onClick={() => {
                    setEditing(true)
                }}
                color={"inherit"}
            >
                <WriteButtonIcon fontSize={"inherit"}/>
            </IconButton></div>}
            {values && values.length > 0 && <Box className={"rounded px-1 py-[6px] cursor-pointer"} sx={{
                background: `var(--${darker(baseColor)})`,
                "&:hover": {
                    background: `var(--${darker(darker(baseColor))})`
                }
            }}>
                <span
                    className={"text-sm line-clamp-1 text-ellipsis"}
                    onClick={() => {
                        setEditing(true)
                    }}>
                    {values.join(", ")}
                </span>
            </Box>}
            <BaseFullscreenPopup closeButton open={editing} onClose={() => {
                setEditing(false)
            }}>
                <div className={"flex flex-col items-center px-4 space-y-4 pb-4 sm:w-[400px]"}>
                    <h3>
                        Editar valores del filtro
                    </h3>
                    <div>
                        {f.column && f.column.length > 0 ? f.column : "sin columna"} {operatorToView(f.operator)}...
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
                        <Button onClick={() => {
                            setEditing(false)
                        }}>
                            Ok
                        </Button>
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
                    <SearchableDropdown
                        options={columnOptions}
                        label={isDatasetSource ? "Columna" : "Propiedad"}
                        size={"small"}
                        fontSize={"12px"}
                        selected={selectedColumn}
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
                    <Select
                        options={operatorOptions}
                        label={"Operador"}
                        value={operatorToView(filter.operator) ?? ""}
                        fontSize={"12px"}
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
                    {isSingleOperand && <SearchableDropdown
                        label={"Valor"}
                        size={"small"}
                        fontSize={"12px"}
                        options={valueOptions}
                        selected={filter.operands && filter.operands.length > 0 ? filter.operands[0] : ""}
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