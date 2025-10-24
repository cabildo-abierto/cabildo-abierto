import React from "react"
import {IconButton} from "../../../layout/utils/icon-button";
import {addDefaults} from "@/components/topics/topic/props/topic-prop-editor";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api"
import {ListDashesIcon} from "@phosphor-icons/react";
import {TopicPropView} from "./topic-props-view";
import {ModalOnHover} from "@/components/layout/utils/modal-on-hover";



export const TopicPropsInHistory = ({topicVersion, topic}: {
    topicVersion: ArCabildoabiertoWikiTopicVersion.VersionInHistory,
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
}) => {
    const props = addDefaults(topicVersion.props, topic.id)

    const modal = <div className={"panel-dark p-3 space-y-2 text-xs max-w-[300px] max-h-[300px] custom-scrollbar overflow-y-auto"}>
        {props.map((p, index) => {
            return <div key={index}>
                <TopicPropView p={p} />
            </div>
        })}
    </div>

    return <ModalOnHover
        modal={modal}
    >
        <div
            className={"text-[var(--text-light)]"}
            onClick={e => {
                e.stopPropagation()
            }}
        >
            <IconButton
                size={"small"}
                textColor={"text-light"}
                color={"transparent"}
                hoverColor={"background-dark2"}
            >
                <ListDashesIcon color={"var(--text-light)"} weight={"regular"}/>
            </IconButton>
        </div>
    </ModalOnHover>
}