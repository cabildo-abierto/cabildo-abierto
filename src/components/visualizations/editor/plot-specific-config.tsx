import SearchableDropdown from "../../../../modules/ui-utils/src/searchable-dropdown";
import {TextField} from "@mui/material";
import {Select} from "../../../../modules/ui-utils/src/select";
import {PlotConfigProps} from "@/lib/types";


export const PlotSpecificConfig = ({config}: {config: PlotConfigProps}) => {
    return null

    /*
    return config.kind != "Tipo de gráfico" && config.datasetUri != null && dataset != null && <>
            {configReq.get(config.kind).map((req, i) => {
                if (req.type == "column") {
                    return <div key={i}>
                        <SearchableDropdown
                            options={dataset.columns.map(c => c.name)}
                            label={req.label}
                            size={"small"}
                            selected={config[req.label]}
                            onChange={(v: string) => {
                                updateConfig(req.label, v)
                            }}
                        />
                    </div>
                } else if (req.type == "string") {
                    return <div key={i}>
                        <TextField
                            label={req.label}
                            size="small"
                            value={config[req.label] ? config[req.label] : ""}
                            InputProps={{
                                autoComplete: "off",
                                sx: { fontSize: "14px" }, // Adjust text input font size
                            }}
                            InputLabelProps={{
                                sx: { fontSize: "14px" }, // Adjust label font size
                            }}
                            fullWidth
                            onChange={(e) => updateConfig(req.label, e.target.value)}
                        />
                    </div>
                } else if (req.type == "select") {
                    return <div key={i}>
                        <Select
                            label={req.label}
                            value={config[req.label] ? config[req.label] : req.defaultValue}
                            options={req.options}
                            onChange={(v) => {
                                updateConfig(req.label, v)
                            }}
                        />
                    </div>
                } else if (req.type == "maybe-column") {
                    return <div key={i}>
                        <SearchableDropdown
                            options={["Fijo", ...dataset.columns.map(c => c.name)]}
                            label={req.label}
                            size={"small"}
                            selected={config[req.label]}
                            onChange={(v: string) => {
                                updateConfig(req.label, v)
                            }}
                        />
                    </div>
                } else {
                    throw Error("Not implemented.")
                }
            })}
    </>
    */
}
