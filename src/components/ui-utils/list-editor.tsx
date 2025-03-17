"use client"

import { useState } from "react"
import {IconButton} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import SearchableDropdown from "./searchable-dropdown";
import { BasicButton } from "./basic-button";
import StateButton from "./state-button";

import {areArraysEqual} from "../utils/arrays";

const NewItem = ({
     addItem,
     availableOptions,
     currentItems,
     newItemText
}: {
    addItem: (c: string) => void
    availableOptions?: string[]
    currentItems: string[]
    newItemText: string
}) => {
    const [value, setValue] = useState("")
    const [writingItem, setWritingItem] = useState(false)

    let options: string[] = undefined
    if(availableOptions){
        options = availableOptions.filter((c) => (!currentItems.includes(c)))
    }

    if(writingItem){
        return <div className={"space-x-2 flex items-center"}>
            <div className={"flex flex-col items-start"}>
                <SearchableDropdown
                    options={availableOptions !== null ? options : null}
                    size={"small"}
                    selected={value}
                    onChange={setValue}
                    onSelect={(v: string) => {addItem(v); setValue(""); setWritingItem(false)}}
                />
            </div>
            <IconButton size={"small"} onClick={() => {
                addItem(value)
                setValue("")
                setWritingItem(false)
            }}>
                <CheckIcon fontSize="small"/>
            </IconButton>
            <IconButton size="small" onClick={() => {
                setValue("");
                setWritingItem(false)
            }}>
                <CloseIcon fontSize="small"/>
            </IconButton>
        </div>
    }

    if(currentItems.length > 0){
        return <IconButton size="small" onClick={() => {
            setWritingItem(true)
        }}>
            <AddIcon fontSize={"small"}/>
        </IconButton>
    } else {
        return <BasicButton
            variant={"text"}
            startIcon={<AddIcon/>}
            color={"inherit"}
            onClick={() => {
                setWritingItem(true)
            }}
        >
            {newItemText}
        </BasicButton>
    }
}


export const ListEditorItem = ({item, removeItem}: {
    item: string, removeItem: () => void}) => {
    const [hovering, setHovering] = useState(false)
    return <button className={"px-2 py-1 border rounded-lg bg-[var(--accent)] flex space-x-1 items-center"}
                   onMouseEnter={() => setHovering(true)}
                   onMouseLeave={() => setHovering(false)}
                   onClick={removeItem}
    >
        <div>
            {item}
        </div>
        {hovering ? <CloseIcon fontSize={"small"}/> : null}
    </button>
}


export const ListEditor = ({
    initialValue=[],
    options,
    onSave,
    onClose,
    newItemText
}: {
    initialValue?: string[]
    options?: string[]
    onSave: (values: string[]) => Promise<{error?: string}>
    onClose: () => void
    newItemText: string
}) => {
    const [items, setItems] = useState(initialValue)

    function removeItem(i: number) {
        return () => {
            setItems([...items.slice(0, i), ...items.slice(i+1)])
        }
    }

    return <div className={"px-2"}>
        <div className={"flex flex-wrap gap-x-2 items-center"}>
            {items.map((c, i) => {
                return <div key={i} className={"h-10"}>
                    <ListEditorItem
                        item={c}
                        removeItem={removeItem(i)}
                    />
                </div>
            })}
            <div className={"h-10"}>
                <NewItem
                    addItem={(c: string) => {setItems([...items, c])}}
                    availableOptions={options}
                    currentItems={items}
                    newItemText={newItemText}
                />
            </div>
        </div>
        <div className={"flex justify-end mt-2 space-x-2 text-[var(--text-light)]"}>
            <BasicButton
                variant={"text"}
                onClick={() => {setItems(initialValue); onClose()}}
                color={"inherit"}
            >
                Cancelar
            </BasicButton>
            <StateButton
                handleClick={async () => {return await onSave(items)}}
                disabled={areArraysEqual(items, initialValue)}
                text1={"Guardar"}
                disableElevation={true}
            />
        </div>
    </div>
}