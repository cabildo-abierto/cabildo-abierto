import React from "react"
import {IconButton} from "../../../layout/utils/icon-button";
import {addDefaults} from "@/components/topics/topic/topic-props-editor";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {ListDashesIcon} from "@phosphor-icons/react";
import DescriptionOnHover from "../../../layout/utils/description-on-hover";
import {TopicPropView} from "../props/topic-props-view";



export const TopicPropsInHistory = ({topicVersion, topic}: {
    topicVersion: ArCabildoabiertoWikiTopicVersion.VersionInHistory,
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
}) => {
    const props = addDefaults(topicVersion.props, topic.id)

    const description = <div className={"space-y-2 text-xs max-w-[300px]"}>
        {props.map((p, index) => {
            return <div key={index}>
                <TopicPropView p={p} />
            </div>
        })}
    </div>

    return <DescriptionOnHover
        description={description}
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
    </DescriptionOnHover>
}