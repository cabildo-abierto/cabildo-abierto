import {
    isDateProp, isNumberProp,
    isStringListProp,
    isStringProp,
    TopicProp,
    TopicView, validateTopicProp
} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {useEffect, useState} from "react";
import {Box, IconButton, TextField} from "@mui/material";
import {ListEditor} from "../../../../modules/ui-utils/src/list-editor";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import {Button} from "../../../../modules/ui-utils/src/button";
import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {Select, MenuItem, FormControl, InputLabel} from "@mui/material";
import {isKnownProp, propsEqualValue, PropValue, PropValueType} from "@/components/topics/topic/utils";
import {useCategories} from "@/queries/useTopics";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import 'dayjs/locale/es';
import InfoPanel from "../../../../modules/ui-utils/src/info-panel";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";

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
    p: TopicProp,
    setProp: (p: TopicProp) => void,
    deleteProp: () => void
}) => {
    const isDefault = isDefaultProp(p)
    const [hovered, setHovered] = useState(false)
    const {data: categories} = useCategories()

    const info: string | null = getDescriptionForProp(p.name)

    return <div className={"flex space-x-2 w-full items-center justify-between"}>
        <div className={"flex items-center"}>
            {info ?
                <div className={"w-8"}><InfoPanel text={info} iconClassName={"text-[var(--text-lighter)]"}/></div> :
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
                <span style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                  {p.name}
                </span>
                    <span className={"text-[var(--text-light)]"}>
                    {!isDefault && hovered && <CloseIcon color={"inherit"}/>}
                </span>
                </Box>
            </Button>
            {isStringListProp(p.value) && <ListEditor
                items={p.value.value}
                setItems={(values: string[]) => {
                    setProp({...p, value: {$type: "ar.cabildoabierto.wiki.topicVersion#stringListProp", value: values}})
                }}
                options={p.name == "Categorías" && categories ? categories : []}
            />}
            {isStringProp(p.value) && <TextField
                value={p.value.value}
                size={"small"}
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
            {isNumberProp(p.value) && <TextField // TO DO: Marcar rojo si no es un número.
                value={isNaN(p.value.value) ? 0 : p.value.value}
                size={"small"}
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
            {isDateProp(p.value) && <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <DatePicker
                    label={"Fecha"}
                    value={dayjs(p.value.value).locale('es')}
                    onChange={(newValue) => {
                        if (newValue?.isValid()) {
                            setProp({
                                ...p,
                                value: {
                                    $type: "ar.cabildoabierto.wiki.topicVersion#dateProp",
                                    value: newValue.toISOString(),
                                },
                            });
                        }
                    }}
                    minDate={dayjs("1000-01-01")}
                    format="DD/MM/YYYY"
                    slotProps={{
                        textField: {size: 'small'},
                        openPickerButton: {
                            sx: {
                                padding: '4px'
                            },
                        },
                    }}
                />
            </LocalizationProvider>}
        </div>
    </div>
}


export function addDefaults(props: TopicProp[], topic: TopicView): TopicProp[] {
    if (!props) props = []
    const newProps: TopicProp[] = []
    for (let i = 0; i < props.length; i++) {
        const p = props[i]
        const valid = validateTopicProp(p)
        if (!valid.success) {
            if (isKnownProp(p.value)) {
                newProps.push({
                    ...p,
                    value: defaultPropValue(p.name, p.value.$type, topic)
                })
            }
        } else {
            newProps.push(p)
        }
    }
    if (!props.some(p => p.name == "Título")) {
        newProps.push({
            name: "Título",
            value: {$type: "ar.cabildoabierto.wiki.topicVersion#stringProp", value: topic.id}
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


export function propsEqual(props1: TopicProp[], props2: TopicProp[]) {
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


export function defaultPropValue(name: string, type: PropValueType, topic: TopicView): PropValue {
    if (name == "Título") {
        return {
            $type: "ar.cabildoabierto.wiki.topicVersion#stringProp",
            value: topic.id
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
            value: ""
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


export function isDefaultProp(p: TopicProp) {
    return ["Título", "Sinónimos", "Categorías"].includes(p.name)
}


function NewPropModal({open, onClose, onAddProp}: {
    open: boolean,
    onClose: () => void,
    onAddProp: (name: string, type: PropValueType) => void
}) {
    const [name, setName] = useState("")
    const [dataType, setDataType] = useState<PropValueType>("ar.cabildoabierto.wiki.topicVersion#stringProp")

    function cleanAndClose() {
        setName("")
        setDataType("ar.cabildoabierto.wiki.topicVersion#stringProp")
        onClose()
    }

    return <BaseFullscreenPopup open={open} onClose={cleanAndClose} closeButton={true}>
        <div className={"px-6 pb-6 space-y-4 flex flex-col items-center"}>
            <div className={"font-semibold"}>
                Nueva propiedad
            </div>
            <div className={"text-sm text-[var(--text-light)] max-w-[300px]"}>
                Agregá una característica del tema.
                Si muchos temas tienen la misma propiedad, se puede hacer una visualización con ellos. <Link
                    href={topicUrl("Cabildo Abierto: Wiki (Temas)", undefined, "normal")}
                    target={"_blank"}
                    className={"hover:underline font-semibold"}
                >
                Más información.
            </Link>
            </div>
            <TextField
                size={"small"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                label={"Nombre de la propiedad"}
                fullWidth
            />
            <FormControl fullWidth size="small">
                <InputLabel>Tipo de datos</InputLabel>
                <Select
                    value={dataType}
                    onChange={(e) => setDataType(e.target.value as PropValueType)}
                    label="Tipo de datos"
                >
                    <MenuItem value={"ar.cabildoabierto.wiki.topicVersion#stringProp"}>Texto</MenuItem>
                    <MenuItem value={"ar.cabildoabierto.wiki.topicVersion#stringListProp"}>Lista de textos</MenuItem>
                </Select>
            </FormControl>
            <Button size={"small"} onClick={() => {
                cleanAndClose();
                onAddProp(name, dataType)
            }} disabled={name.length == 0}>
                Aceptar
            </Button>
        </div>
    </BaseFullscreenPopup>
}


function validProps(props: TopicProp[]) {
    return props.filter(p => {
        const res = validateTopicProp(p)
        return res.success
    })
}


export const TopicPropsEditor = ({props, setProps, topic, onClose}: {
    props: TopicProp[],
    setProps: (props: TopicProp[]) => void,
    topic: TopicView,
    onClose: () => void
}) => {
    const [creatingProp, setCreatingProp] = useState(false)

    useEffect(() => {
        const newProps = addDefaults(props, topic)
        if (!propsEqual(newProps, props)) {
            setProps(newProps)
        }
    }, [])

    function setProp(p: TopicProp) {
        if (props.some(p2 => p2.name == p.name)) {
            const newProps = [...props]
            const index = newProps.findIndex(p2 => p2.name == p.name)
            newProps[index] = p
            setProps(newProps)
        } else {
            setProps([...props, p])
        }
    }

    function addProp(name: string, type: PropValueType) {
        setProps([
            ...props,
            {
                name,
                value: defaultPropValue(name, type, topic),
            }
        ])
    }

    function resetProps() {
        setProps(addDefaults(topic.props, topic))
    }

    const vProps = validProps(props)

    return <div className={"border rounded p-4 space-y-6 my-4 mx-2 bg-[var(--background-dark)]"}>
        <div className={"font-semibold flex items-center space-x-2"}>
            <div>Propiedades</div>
        </div>
        <div className={"space-y-6"}>
            {vProps.map((p, index) => {
                return <div key={index}>
                    <TopicPropEditor p={p} setProp={setProp} deleteProp={() => {
                        setProps(vProps.filter(p2 => p2.name != p.name))
                    }}/>
                </div>
            })}
        </div>
        <div className={"flex justify-between"}>
            <Button style={{width: 120}} onClick={() => {
                setCreatingProp(true)
            }} size={"small"} variant={"contained"}>
                Nueva propiedad
            </Button>
            <div className={"text-[var(--text-light)] space-x-2"}>
                <IconButton size={"small"} onClick={resetProps} color={"inherit"}>
                    <DeleteOutlineIcon color={"inherit"}/>
                </IconButton>
                <IconButton size={"small"} onClick={() => {
                    resetProps();
                    onClose()
                }} color={"inherit"}>
                    <CloseIcon color={"inherit"}/>
                </IconButton>
            </div>
        </div>
        <NewPropModal
            open={creatingProp}
            onClose={() => {
                setCreatingProp(false)
            }}
            onAddProp={addProp}
        />
    </div>
}