import {useState} from "react"
import {BaseIconButton} from "@/components/layout/base/base-icon-button"
import BaseTextFieldWithSuggestions from "../base/base-text-field-with-suggestions";
import {BaseButton} from "../base/baseButton";
import {CheckIcon, PlusIcon, TrashIcon} from "@phosphor-icons/react";
import {produce} from "immer";

const ListEditorNewItem = ({
                               addItem,
                               currentItems,
                           }: {
    addItem: (c: string) => void
    currentItems: string[]
}) => {
    if (currentItems.length > 0) {
        return <BaseIconButton
            size="small"
            onClick={() => {
                addItem("")
            }}
        >
            <PlusIcon fontSize={14}/>
        </BaseIconButton>
    } else {
        return <BaseButton
            onClick={() => {
                addItem("")
            }}
            size={"small"}
        >
            Agregar
        </BaseButton>
    }
}


export const ListEditorItem = ({
                                   item,
                                   removeItem,
                                   options,
                                   onChange,
                                   editing,
                                   setEditing
                               }: {
    editing: boolean
    item: string
    removeItem: () => void
    onChange: (v: string, selected: boolean) => void
    setEditing: (v: boolean) => void
    options?: string[]
}) => {

    if (!editing) {
        return <div
            onClick={() => {
                setEditing(true)
            }}
            className={"group-[.portal]:bg-[var(--background-dark2)] bg-[var(--background-dark)] border-[var(--accent-dark)] cursor-pointer text-sm normal-case group-[.portal]:hover:bg-[var(--background-dark3)] hover:bg-[var(--background-dark2)] border p-1 break-all"}
        >
            {item}
        </div>
    }

    return <BaseTextFieldWithSuggestions
        value={item}
        options={options}
        onChange={onChange}
        inputClassName={"py-1"}
        endIconClassName={"pr-1"}
        className={"w-48"}
        endIcon={<div className={"flex space-x-1"}>
            <BaseIconButton
                disabled={item.length == 0}
                size={"small"}
                onClick={() => {
                    setEditing(false)
                }}
            >
                <CheckIcon/>
            </BaseIconButton>
            <BaseIconButton
                size={"small"}
                onClick={removeItem}
            >
                <TrashIcon/>
            </BaseIconButton>
        </div>}
    />
}


export const ListEditor = ({
                               newItemText,
                               options = [],
                               items,
                               setItems
                           }: {
    newItemText?: string
    options?: string[]
    items: string[]
    setItems: (v: string[]) => void
}) => {
    const [editing, setEditing] = useState<number | null>(null)

    function removeItem(i: number) {
        return () => {
            if (setItems) setItems([...items.slice(0, i), ...items.slice(i + 1)])
        }
    }

    return <div className={"flex flex-wrap gap-1 items-center"}>
        {items.map((c, i) => {
            return <div key={i}>
                <ListEditorItem
                    editing={i == editing}
                    setEditing={(v: boolean) => {
                        setEditing(v ? i : null)
                    }}
                    options={options}
                    item={c}
                    removeItem={setItems ? removeItem(i) : undefined}
                    onChange={(v, selected) => {
                        setItems(produce(items, draft => {
                            draft[i] = v
                        }))
                        if(selected) {
                            setEditing(null)
                        }
                    }}
                />
            </div>
        })}
        {setItems && editing != items.length - 1 && <ListEditorNewItem
            addItem={(c: string) => {
                setItems([...items, c])
                setEditing(items.length)
            }}
            currentItems={items}
        />}
        {!setItems && items.length == 0 && <div>
            ---
        </div>}
    </div>
}


export const ListView = ({items}: {
    items: string[]
}) => {
    return <div className={"flex flex-wrap gap-1 items-center"}>
        {items.map((c, i) => {
            return <div key={i} className={"text-sm normal-case border border-[var(--accent-dark)] group-[.portal]:bg-[var(--background-dark2)] p-1 break-all"}>
                {c}
            </div>
        })}
    </div>
}