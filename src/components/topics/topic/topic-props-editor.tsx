import {
    isDateProp,
    isStringListProp,
    isStringProp,
    TopicProp,
    TopicView
} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {useEffect, useState} from "react";
import {Box, IconButton, TextField} from "@mui/material";
import {ListEditor} from "../../../../modules/ui-utils/src/list-editor";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import {Button} from "../../../../modules/ui-utils/src/button";
import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {Select, MenuItem, FormControl, InputLabel} from "@mui/material";
import {propsEqualValue, PropValue, PropValueType} from "@/components/topics/topic/utils";
import {useCategories} from "@/queries/api";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import 'dayjs/locale/es';

export const TopicPropEditor = ({p, setProp, deleteProp}: {
    p: TopicProp,
    setProp: (p: TopicProp) => void,
    deleteProp: () => void
}) => {
    const isDefault = isDefaultProp(p)
    const [hovered, setHovered] = useState(false)
    const {data: categories} = useCategories()

    return <div className={"flex space-x-8 w-full items-center"}>
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
            options={p.name == "Categorías" ? categories?.map(c => c.category) : []}
        />}
        {isStringProp(p.value) && <TextField
            value={p.value.value}
            size={"small"}
            onChange={(e) => {
                setProp({...p, value: {$type: "ar.cabildoabierto.wiki.topicVersion#stringProp", value: e.target.value}})
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
                format="DD/MM/YYYY"
                slotProps={{
                    textField: { size: 'small' },
                    openPickerButton: {
                        sx: {
                            padding: '4px'
                        },
                    },
                }}
            />
        </LocalizationProvider>}
    </div>
}


export function addDefaults(props: TopicProp[], topic: TopicView) {
    if (!props) props = []
    const newProps = [...props]
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
        <div className={"px-6 pb-6 space-y-6 flex flex-col items-center"}>
            <div className={"font-semibold"}>Nueva propiedad</div>
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
            console.log("setting props", newProps)
            setProps(newProps)
        }
    }, [props])

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

    return <div className={"border rounded p-4 space-y-6 my-4 mx-2 bg-[var(--background-dark)]"}>
        <div className={"font-semibold flex items-center space-x-2"}>
            <div>Propiedades</div>
        </div>
        <div className={"space-y-6"}>
            {props.map((p, index) => {
                return <div key={index}>
                    <TopicPropEditor p={p} setProp={setProp} deleteProp={() => {
                        setProps(props.filter(p2 => p2.name != p.name))
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