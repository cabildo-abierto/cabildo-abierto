


import {TopicProp, TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {useEffect, useState} from "react";
import {Box, TextField} from "@mui/material";
import {ListEditor} from "../../../../../modules/ui-utils/src/list-editor";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "../../../../../modules/ui-utils/src/button";
import {addDefaults, isDefaultProp, propsEqual} from "../topic-props-editor";


export const TopicPropView = ({p}: {p: TopicProp}) => {
    const isDefault = isDefaultProp(p)
    const [hovered, setHovered] = useState(false)

    return <div className={"flex space-x-8 w-full items-center"}>

        <Button
            variant="text"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
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
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name}
                </span>
                <span className={"text-[var(--text-light)]"}>
                    {!isDefault && hovered && <CloseIcon color={"inherit"}/>}
                </span>
            </Box>
        </Button>
        {p.dataType == "string[]" && <ListEditor
            items={JSON.parse(p.value)}
        />}
        {p.dataType == "string" && <div>
            {p.value}
        </div>}
    </div>
}


export const TopicPropsView = ({topic}: {topic: TopicView}) => {
    const [props, setProps] = useState(topic.props)

    useEffect(() => {
        const newProps = addDefaults(props, topic)
        if(!propsEqual(newProps, props)){
            setProps(newProps)
        }
    }, [props])

    return <div className={"border rounded p-4 space-y-6 m-4"}>
        <div className={"font-semibold flex items-center space-x-2"}>
            <div>Propiedades</div>
        </div>
        <div className={"space-y-6"}>
            {props.map((p, index) => {
                return <div key={index}>
                    <TopicPropView p={p} />
                </div>
            })}
        </div>
    </div>
}