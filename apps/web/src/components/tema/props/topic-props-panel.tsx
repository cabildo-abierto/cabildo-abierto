import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {addDefaults} from "./topic-prop-editor";
import {CaretDoubleLeftIcon, CaretDoubleRightIcon} from "@phosphor-icons/react";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {useEffect, useMemo, useState} from "react";
import {BaseButton} from "@/components/utils/base/base-button";
import {LayoutConfigProps, useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import {TopicPropView} from "./topic-prop-view";

function propsStartOpen(props: ArCabildoabiertoWikiTopicVersion.TopicProp[], isMobile: boolean, layoutConfig: LayoutConfigProps) {
    return !isMobile && layoutConfig.spaceForRightSide && props.some(p => !["Título", "Categorías", "Sinónimos"].includes(p.name))
}

export const TopicPropsPanel = ({topic}: { topic: ArCabildoabiertoWikiTopicVersion.TopicView }) => {
    const props = useMemo(() => {
        return addDefaults(topic.props, topic.id)
    }, [topic])
    const {isMobile, layoutConfig} = useLayoutConfig()
    const [open, setOpen] = useState(propsStartOpen(props, isMobile, layoutConfig))

    useEffect(() => {
        setOpen(propsStartOpen(props, isMobile, layoutConfig))
    }, [topic, layoutConfig.spaceForRightSide])

    if (!open) {
        return <BaseButton
            size={"default"}
            variant={"outlined"}
            onClick={() => {
                if (!open) setOpen(true)
            }}
            startIcon={<CaretDoubleLeftIcon/>}
            className={"[&_svg]:size-4"}
        >
            Ficha
        </BaseButton>
    }

    function cmp(a: ArCabildoabiertoWikiTopicVersion.TopicProp, b: ArCabildoabiertoWikiTopicVersion.TopicProp) {
        const priority = {
            "Sinónimos": 0,
            "Foto": 2
        }
        return (priority[b.name] ?? 1) - (priority[a.name] ?? 1)
    }

    return <div
        onWheel={e => {e.stopPropagation()}}
        className={"bg-[var(--background-dark)] portal group space-y-4 border border-[var(--accent-dark)] w-[292px] max-h-[80vh] overflow-y-auto custom-scrollbar px-3 py-3 pb-4"}
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
        <div className={"space-y-3 w-full"}>
            {props.toSorted(cmp).map((p, index) => {
                return <div key={index}>
                    <TopicPropView p={p}/>
                </div>
            })}
        </div>
    </div>
}