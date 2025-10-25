import {TopicProp, TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {addDefaults} from "@/components/topics/topic/props/topic-prop-editor";
import {formatIsoDate} from "@/utils/dates";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api"
import Image from "next/image"
import {ListEditor} from "@/components/layout/utils/list-editor";
import {CaretDoubleLeftIcon, CaretDoubleRightIcon} from "@phosphor-icons/react";
import {IconButton} from "@/components/layout/utils/icon-button";
import {useEffect, useMemo, useState} from "react";
import {Button} from "@/components/layout/utils/button";
import {LayoutConfigProps, useLayoutConfig} from "@/components/layout/layout-config-context";
import {getDescriptionForProp} from "@/components/topics/topic/props/topic-props-editing-panel";
import DescriptionOnHover from "@/components/layout/utils/description-on-hover";


const TopicStringPropViewValue = ({name, value}: { name: string, value: string }) => {
    if (name == "Foto") {
        return <Image
            src={value}
            alt={name}
            width={400}
            height={400}
            className={"w-36 h-auto object-contain border border-[var(--accent-dark)]"}
        />
    } else {
        return <div className={"text-sm"}>{value}</div>
    }
}


const TopicPropView = ({p}: { p: ArCabildoabiertoWikiTopicVersion.TopicProp }) => {
    if (p.name == "Título" || p.name == "Categorías") return null
    const {info, moreInfoHref} = getDescriptionForProp(p.name)

    return <div className={"flex space-x-3 w-full"}>
        <DescriptionOnHover description={info} moreInfoHref={moreInfoHref}>
            <div className={"w-1/3 text-sm text-[var(--text-light)]"}>
                {p.name}
            </div>
        </DescriptionOnHover>
        <div className={"w-2/3 break-words"}>
            {ArCabildoabiertoWikiTopicVersion.isStringListProp(p.value) && <ListEditor
                items={p.value.value}
            />}
            {ArCabildoabiertoWikiTopicVersion.isStringProp(p.value) && <TopicStringPropViewValue
                name={p.name}
                value={p.value.value}
            />}
            {ArCabildoabiertoWikiTopicVersion.isNumberProp(p.value) && <div className={"text-sm"}>
                {p.value.value}
            </div>}
            {ArCabildoabiertoWikiTopicVersion.isDateProp(p.value) && <div className={"text-sm"}>
                {formatIsoDate(p.value.value, false)}
            </div>}
        </div>
    </div>
}

function propsStartOpen(props: TopicProp[], isMobile: boolean, layoutConfig: LayoutConfigProps) {
    return !isMobile && layoutConfig.spaceForRightSide && props.some(p => !["Título", "Categorías", "Sinónimos"].includes(p.name))
}

export const TopicPropsPanel = ({topic}: { topic: TopicView }) => {
    const props = useMemo(() => {
        return addDefaults(topic.props, topic.id)
    }, [topic])
    const {isMobile, layoutConfig} = useLayoutConfig()
    const [open, setOpen] = useState(propsStartOpen(props, isMobile, layoutConfig))

    useEffect(() => {
        setOpen(propsStartOpen(props, isMobile, layoutConfig))
    }, [topic, layoutConfig.spaceForRightSide])

    if (!open) {
        return <Button
            size={"small"}
            variant={"outlined"}
            color={"background-dark"}
            onClick={() => {
                if (!open) setOpen(true)
            }}
            startIcon={<CaretDoubleLeftIcon/>}
        >
            <div className={"uppercase text-sm"}>Ficha</div>
        </Button>
    }

    function cmp(a: TopicProp, b: TopicProp) {
        const priority = {
            "Sinónimos": 0,
            "Foto": 2
        }
        return (priority[b.name] ?? 1) - (priority[a.name] ?? 1)
    }

    return <div
        onWheel={e => {e.stopPropagation()}}
        className={"bg-[var(--background-dark)] space-y-4 border border-[var(--accent-dark)] w-[292px] max-h-[80vh] overflow-y-auto custom-scrollbar px-2 pt-2 pb-4"}
    >
        <div className={"font-semibold flex items-center space-x-2"}>
            <IconButton
                size={"small"}
                onClick={() => {
                    setOpen(false)
                }}
                color={"background-dark"}
                sx={{borderRadius: 0}}
            >
                <CaretDoubleRightIcon/>
            </IconButton>
            <div className={"uppercase text-sm"}>Ficha</div>
        </div>
        <div className={"space-y-3 w-full"}>
            {props.toSorted(cmp).map((p, index) => {
                return <div key={index}>
                    <TopicPropView p={p}/>
                </div>
            })}
        </div>
    </div>
}