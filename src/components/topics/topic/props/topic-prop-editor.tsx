import {useState} from "react";
import {Box} from "@mui/material";
import {ListEditor} from "../../../layout/utils/list-editor";
import CloseIcon from "@mui/icons-material/Close";
import {Button} from "../../../layout/utils/button";
import {isKnownProp, propsEqualValue, PropValue, PropValueType} from "@/components/topics/topic/utils";
import {useCategories} from "@/queries/getters/useTopics";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import InfoPanel from "../../../layout/utils/info-panel";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api";
import {TextField} from "../../../layout/utils/text-field";


function getDescriptionForProp(propName: string) {
    if (propName == "Categorías") {
        return "Las categorías del tema. Si elegís una que no existe se crea automáticamente una nueva categoría."
    } else if (propName == "Sinónimos") {
        return "Sinónimos del título del tema. Se considera que un tema fue mencionado en alguna publicación o artículo si alguno de sus sinónimos (o su título) aparece en el contenido. Esto afecta la popularidad del tema y el muro de menciones de la página del tema."
    } else if (propName == "Título") {
        return "El título del tema. Usá esta propiedad para cambiar su título."
    }
    return null
}

export const TopicPropEditor = ({p, setProp, deleteProp}: {
    p: ArCabildoabiertoWikiTopicVersion.TopicProp,
    setProp: (p: ArCabildoabiertoWikiTopicVersion.TopicProp) => void,
    deleteProp: () => void
}) => {
    const isDefault = isDefaultProp(p)
    const [hovered, setHovered] = useState(false)
    const {data: categories} = useCategories()

    const info: string | null = getDescriptionForProp(p.name)

    return <div className={"flex space-x-2 w-full items-center justify-between"}>
        <div className={"flex items-center space-x-4"}>
            {info ?
                <div className={"w-8"}>
                    <InfoPanel
                        text={info}
                    />
                </div> :
                <div className={"w-8"}/>
            }
            <Button
                color={"transparent"}
                variant="text"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={deleteProp}
                disabled={isDefault}
                sx={{
                    textTransform: "none",
                    width: 120,
                    justifyContent: "flex-start",
                    color: "var(--text)",
                    '&.Mui-disabled': {
                        color: "var(--text)",
                    },
                    padding: '6px 8px', // optional: tighter control over padding
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span className="text-sm"
                          style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                      {p.name}
                    </span>
                    <span className={"text-[var(--text-light)]"}>
                    {!isDefault && hovered && <CloseIcon color={"inherit"}/>}
                </span>
                </Box>
            </Button>
            {ArCabildoabiertoWikiTopicVersion.isStringListProp(p.value) && <ListEditor
                items={p.value.value}
                color={"background"}
                setItems={(values: string[]) => {
                    setProp({...p, value: {$type: "ar.cabildoabierto.wiki.topicVersion#stringListProp", value: values}})
                }}
                options={p.name == "Categorías" && categories ? categories : []}
            />}
            {ArCabildoabiertoWikiTopicVersion.isStringProp(p.value) && <TextField
                value={p.value.value}
                size={"small"}
                fontSize={13}
                paddingX={"0px"}
                paddingY={"6px"}
                onChange={(e) => {
                    setProp({
                        ...p,
                        $type: "ar.cabildoabierto.wiki.topicVersion#topicProp",
                        value: {
                            $type: "ar.cabildoabierto.wiki.topicVersion#stringProp",
                            value: e.target.value
                        },
                    })
                }}
            />}
            {ArCabildoabiertoWikiTopicVersion.isNumberProp(p.value) &&
                <TextField // TO DO: Marcar rojo si no es un número.
                    value={isNaN(p.value.value) ? 0 : p.value.value}
                    size={"small"}
                    fontSize={12}
                    onChange={(e) => {
                        const v = parseInt(e.target.value)
                        setProp({
                            ...p,
                            value: {
                                $type: "ar.cabildoabierto.wiki.topicVersion#numberProp",
                                value: v && !isNaN(v) ? v : 0
                            }
                        })
                    }}
                />}
            {/*TO DO: Achicar el icono del date picker*/}
            {ArCabildoabiertoWikiTopicVersion.isDateProp(p.value) &&
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                    <DatePicker
                        value={p.value.value ? dayjs(p.value.value) : dayjs()}
                        onChange={(d) => {
                            console.log("date", d, d.startOf("day").toISOString())
                            setProp({
                                ...p,
                                value: {
                                    $type: "ar.cabildoabierto.wiki.topicVersion#dateProp",
                                    value: d.startOf("day").toISOString(),
                                }
                            })
                        }}
                        label={"Fecha"}
                        minDate={dayjs("1000-01-01")}
                        format="DD/MM/YYYY"
                        sx={{
                            "& .MuiInputLabel-root": {
                                color: `var(--text)`,
                            },
                            "& .MuiPickersInputBase-root": {
                                borderRadius: 0,
                                fontSize: "13px",
                                "&:hover fieldset": {
                                    borderColor: `var(--accent-dark)`,
                                },
                                "& fieldset": {
                                    borderRadius: 0,
                                    borderColor: `var(--accent-dark)`,
                                    borderWidth: 1,
                                },
                                "&.Mui-focused fieldset": {
                                    borderWidth: 1,
                                    borderRadius: 0,
                                    color: `var(--text)`,
                                    "&.MuiPickersOutlinedInput-notchedOutline": {
                                        borderColor: `var(--accent-dark)`
                                    }
                                },
                            }
                        }}
                        slotProps={{
                            textField: {
                                size: "small",
                            },
                        }}
                    />
                </LocalizationProvider>}
        </div>
    </div>
}


export function addDefaults(props: ArCabildoabiertoWikiTopicVersion.TopicProp[], topicId: string): ArCabildoabiertoWikiTopicVersion.TopicProp[] {
    if (!props) props = []
    const newProps: ArCabildoabiertoWikiTopicVersion.TopicProp[] = []
    for (let i = 0; i < props.length; i++) {
        const p = props[i]
        const valid = ArCabildoabiertoWikiTopicVersion.validateTopicProp(p)
        if (!valid.success) {
            if (isKnownProp(p.value)) {
                newProps.push({
                    ...p,
                    value: defaultPropValue(p.name, p.value.$type, topicId)
                })
            }
        } else {
            newProps.push(p)
        }
    }
    if (!props.some(p => p.name == "Título")) {
        newProps.push({
            name: "Título",
            value: {$type: "ar.cabildoabierto.wiki.topicVersion#stringProp", value: topicId}
        })
    }
    if (!props.some(p => p.name == "Categorías")) {
        newProps.push({
            name: "Categorías",
            value: {$type: "ar.cabildoabierto.wiki.topicVersion#stringListProp", value: []}
        })
    }
    if (!props.some(p => p.name == "Sinónimos")) {
        newProps.push({
            name: "Sinónimos",
            value: {$type: "ar.cabildoabierto.wiki.topicVersion#stringListProp", value: []}
        })
    }
    return newProps
}


export function propsEqual(props1: ArCabildoabiertoWikiTopicVersion.TopicProp[], props2: ArCabildoabiertoWikiTopicVersion.TopicProp[]) {
    if (props1.length != props2.length) {
        return false
    }
    for (let i = 0; i < props1.length; i++) {
        if (props1[i].name != props2[i].name || !propsEqualValue(props1[i].value, props2[i].value)) {
            return false
        }
    }
    return true
}


export function defaultPropValue(name: string, type: PropValueType, topicId: string): PropValue {
    if (name == "Título") {
        return {
            $type: "ar.cabildoabierto.wiki.topicVersion#stringProp",
            value: topicId
        }
    } else if (type == "ar.cabildoabierto.wiki.topicVersion#stringProp") {
        return {
            $type: "ar.cabildoabierto.wiki.topicVersion#stringProp",
            value: ""
        }
    } else if (type == "ar.cabildoabierto.wiki.topicVersion#stringListProp") {
        return {
            $type: "ar.cabildoabierto.wiki.topicVersion#stringListProp",
            value: []
        }
    } else if (type == "ar.cabildoabierto.wiki.topicVersion#dateProp") {
        return {
            $type: "ar.cabildoabierto.wiki.topicVersion#dateProp",
            value: new Date().toISOString()
        }
    } else if (type == "ar.cabildoabierto.wiki.topicVersion#numberProp") {
        return {
            $type: "ar.cabildoabierto.wiki.topicVersion#numberProp",
            value: 0
        }
    } else if (type == "ar.cabildoabierto.wiki.topicVersion#booleanProp") {
        return {
            $type: "ar.cabildoabierto.wiki.topicVersion#booleanProp",
            value: false
        }
    } else {
        throw Error("Tipo de datos desconocido: " + type)
    }
}


export function isDefaultProp(p: ArCabildoabiertoWikiTopicVersion.TopicProp) {
    return ["Título", "Sinónimos", "Categorías"].includes(p.name)
}