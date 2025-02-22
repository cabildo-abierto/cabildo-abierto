"use client"

import { useState } from "react"
import { areArraysEqual } from "@mui/base";
import StateButton from "./state-button";
import {currentCategories} from "./utils";
import { TopicProps } from "../app/lib/definitions";
import {BasicButton} from "./ui-utils/basic-button";
import {IconButton} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import {updateCategoriesInTopic} from "../actions/topics";
import {useCategories} from "../hooks/contents";
import SearchableDropdown from "./ui-utils/searchable-dropdown";
import {ListEditor} from "./ui-utils/list-editor";





export const RoutesEditor = ({topic, setEditing}: {topic: TopicProps, setEditing: (v: boolean) => void}) => {
    const current = currentCategories(topic)
    const {categories: availableCategories} = useCategories()


    async function saveCategories(categories: string[]){
        await updateCategoriesInTopic({topicId: topic.id, categories})
        setEditing(false)
        return {}
    }

    return <ListEditor
        initialValue={current}
        options={availableCategories}
        onSave={saveCategories}
        onClose={() => {setEditing(false)}}
        newItemText={"Nueva categoría"}
    />
}