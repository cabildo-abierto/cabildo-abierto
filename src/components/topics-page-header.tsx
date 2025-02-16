import SelectionComponent from "./search-selection-component";
import {Button} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";
import {CreateTopicModal} from "./create-topic-modal";


export type TopicsSortOrder = "Populares" | "Ediciones recientes"


export const TopicsPageHeader = ({
    sortedBy,
    setSortedBy
}: {
    sortedBy: TopicsSortOrder,
    setSortedBy: (s: TopicsSortOrder) => void
}) => {
    const [newTopicOpen, setNewTopicOpen] = useState(false)

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] w-44">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0
                }}
            >
                <div className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div className="flex justify-between border-b pr-2 items-center">
        <SelectionComponent
            onSelection={setSortedBy}
            options={["Populares", "Ediciones recientes"]}
            selected={sortedBy}
            optionsNodes={optionsNodes}
            className="flex justify-between"
        />
        <Button
            color="primary"
            variant="text"
            disableElevation={true}
            startIcon={<AddIcon/>}
            size={"small"}
            sx={{textTransform: "none", height: "32px"}}
            onClick={() => {
                setNewTopicOpen(true)
            }}
        >
            Nuevo tema
        </Button>
        <CreateTopicModal open={newTopicOpen} onClose={() => setNewTopicOpen(false)} />
    </div>
}