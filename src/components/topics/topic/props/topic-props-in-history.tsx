import React from "react"
import {BaseIconButton} from "../../../layout/base/base-icon-button";
import {addDefaults} from "@/components/topics/topic/props/topic-prop-editor";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api"
import {ListDashesIcon} from "@phosphor-icons/react";
import {TopicPropView} from "./topic-prop-view";
import {ModalOnHover} from "@/components/layout/utils/modal-on-hover";



export const TopicPropsInHistory = ({topicVersion, topic}: {
    topicVersion: ArCabildoabiertoWikiTopicVersion.VersionInHistory,
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
}) => {
    const props = addDefaults(topicVersion.props, topic.id)

    const modal = <>
        <div className={"uppercase text-sm font-semibold"}>
            Ficha
        </div>
        {props.map((p, index) => {
            return <div key={index}>
                <TopicPropView p={p} />
            </div>
        })}
    </>

    return <ModalOnHover
        modal={modal}
        className={"max-w-[300px] space-y-2 max-h-[300px] custom-scrollbar overflow-auto"}
    >
        <BaseIconButton
            size={"small"}
            onClick={e => {
                e.stopPropagation()
            }}
        >
            <ListDashesIcon weight={"regular"}/>
        </BaseIconButton>
    </ModalOnHover>
}