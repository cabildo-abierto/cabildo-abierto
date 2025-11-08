import {useEffect, useState} from "react";
import {ListEditor} from "@/components/layout/utils/list-editor";
import {BaseButton} from "@/components/layout/base/baseButton";
import {isKnownProp, propsEqualValue, PropValue, PropValueType} from "@/components/topics/topic/utils";
import {useCategories} from "@/queries/getters/useTopics";
import 'dayjs/locale/es';
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api";
import dynamic from "next/dynamic";
import {BaseTextField} from "@/components/layout/base/base-text-field";
import {BaseIconButton} from "@/components/layout/base/base-icon-button";
import {CaretDoubleLeftIcon, CaretDoubleRightIcon, TrashIcon, XIcon} from "@phosphor-icons/react";
import DescriptionOnHover from "@/components/layout/utils/description-on-hover";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {cn} from "@/lib/utils";
import {BaseTextArea} from "@/components/layout/base/base-text-area";
import {DatePropEditor} from "@/components/topics/topic/props/date-prop-editor";
import InfoPanel from "@/components/layout/utils/info-panel";
import {getDescriptionForProp} from "@/components/topics/topic/props/topic-prop-view";

const NewPropModal = dynamic(
    () => import("@/components/topics/topic/props/new-prop-modal"),
    {ssr: false})

export const TopicPropEditor = ({
                                    p,
                                    setProp,
                                    deleteProp
}: {
    p: ArCabildoabiertoWikiTopicVersion.TopicProp,
    setProp: (p: ArCabildoabiertoWikiTopicVersion.TopicProp) => void,
    deleteProp: () => void
}) => {
    const isDefault = isDefaultProp(p)
    const {data: categories} = useCategories()

    if (p.name == "Categorías" || p.name == "Título") return

    const {info, moreInfoHref} = getDescriptionForProp(p.name)

    return <div className={"flex flex-col space-y-1"}>
        <div className={"flex justify-between items-center w-full"}>
            <div className={"flex space-x-1 items-center"}>
                <DescriptionOnHover description={info} moreInfoHref={moreInfoHref}>
                    <div className={"text-sm text-[var(--text-light)]"}>
                        {p.name}
                    </div>
                </DescriptionOnHover>
                {info && <InfoPanel text={info} moreInfoHref={moreInfoHref} iconFontSize={16}/>}
            </div>
            {!isDefault && <BaseIconButton variant={"default"} size={"small"}>
                <TrashIcon/>
            </BaseIconButton>}
        </div>
        {ArCabildoabiertoWikiTopicVersion.isStringListProp(p.value) && <ListEditor
            items={p.value.value}
            setItems={(values: string[]) => {
                setProp({...p, value: {$type: "ar.cabildoabierto.wiki.topicVersion#stringListProp", value: values}})
            }}
            options={p.name == "Categorías" && categories ? categories : []}
        />}
        {ArCabildoabiertoWikiTopicVersion.isStringProp(p.value) && <BaseTextArea
            inputClassName={"resize min-h-[35px]"}
            value={p.value.value}
            rows={1}
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
            <BaseTextField // TO DO: Marcar rojo si no es un número.
                value={isNaN(p.value.value) ? 0 : p.value.value}
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
        {ArCabildoabiertoWikiTopicVersion.isDateProp(p.value) &&
            <DatePropEditor
                propName={p.name}
                date={p.value.value ? new Date(p.value.value) : new Date(0)}
                setProp={setProp}
            />}
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


function validProps(props: ArCabildoabiertoWikiTopicVersion.TopicProp[]) {
    return props.filter(p => {
        const res = ArCabildoabiertoWikiTopicVersion.validateTopicProp(p)
        return res.success
    })
}


export const TopicPropsEditingPanel = ({props, setProps, topic}: {
    props: ArCabildoabiertoWikiTopicVersion.TopicProp[],
    setProps: (props: ArCabildoabiertoWikiTopicVersion.TopicProp[]) => void,
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
}) => {
    const [open, setOpen] = useState(false)
    const [creatingProp, setCreatingProp] = useState(false)
    const {isMobile} = useLayoutConfig()

    useEffect(() => {
        const newProps = addDefaults(props, topic.id)
        if (!propsEqual(newProps, props)) {
            setProps(newProps)
        }
    }, [])

    if (!open) {
        return <BaseButton
            variant={"outlined"}
            size={"default"}
            onClick={() => {
                if (!open) setOpen(true)
            }}
            startIcon={<CaretDoubleLeftIcon/>}
        >
            Ficha
        </BaseButton>
    }

    function setProp(p: ArCabildoabiertoWikiTopicVersion.TopicProp) {
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
                value: defaultPropValue(name, type, topic.id),
            }
        ])
    }

    function resetProps() {
        setProps(addDefaults(topic.props, topic.id))
    }

    const vProps = validProps(props)

    return <div
        onWheel={e => e.stopPropagation()}
        className={cn("bg-[var(--background-dark)] portal group px-2 pt-2 pb-2 border space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar", isMobile ? "w-[90vw] max-w-[500px]" : "w-[500px]")}
    >
        <div className={"font-semibold flex items-center space-x-2"}>
            <BaseIconButton
                size={"small"}
                onClick={() => {
                    setOpen(false)
                }}
            >
                <CaretDoubleRightIcon/>
            </BaseIconButton>
            <div className={"uppercase text-sm"}>Ficha</div>
        </div>
        <div className={"space-y-6"}>
            {vProps.map((p, index) => {
                return <div key={index}>
                    <TopicPropEditor
                        p={p}
                        setProp={setProp}
                        deleteProp={() => {
                            setProps(vProps.filter(p2 => p2.name != p.name))
                        }}
                    />
                </div>
            })}
        </div>
        <div className={"flex justify-between items-center"}>
            <BaseButton
                onClick={() => {
                    setCreatingProp(true)
                }}
                size={"small"}
                className={"text-[11px]"}
            >
                Nueva propiedad
            </BaseButton>
            <div className={"text-[var(--text-light)] flex space-x-2 items-center"}>
                <DescriptionOnHover description={"Cancelar cambios"}>
                    <BaseIconButton
                        size={"small"}
                        onClick={resetProps}
                    >
                        <TrashIcon color="var(--text)" fontSize={18}/>
                    </BaseIconButton>
                </DescriptionOnHover>
                <BaseIconButton
                    size={"small"}
                    onClick={() => {
                        resetProps();
                        setOpen(false)
                    }}
                >
                    <XIcon color={"var(--text)"} fontSize={18}/>
                </BaseIconButton>
            </div>
        </div>
        {creatingProp && <NewPropModal
            open={creatingProp}
            onClose={() => {
                setCreatingProp(false)
            }}
            onAddProp={addProp}
            currentProps={props}
        />}
    </div>
}