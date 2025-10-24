import {useState} from "react"
import {IconButton} from "@/components/layout/utils/icon-button"
import AddIcon from "@mui/icons-material/Add";
import SearchableDropdown from "./searchable-dropdown";
import {Button, darker} from "./button";
import {Color} from "./color";
import {CheckIcon, PlusIcon, XIcon} from "@phosphor-icons/react";

const NewItem = ({
                     addItem,
                     availableOptions,
                     currentItems,
                     newItemText,
                     color
                 }: {
    addItem: (c: string) => void
    availableOptions?: string[]
    currentItems: string[]
    newItemText?: string
    color?: Color
}) => {
    const [value, setValue] = useState("")
    const [writingItem, setWritingItem] = useState(false)

    let options: string[] = undefined
    if (availableOptions) {
        options = availableOptions.filter((c) => (!currentItems.includes(c)))
    }

    if (writingItem) {
        return <div className={"space-x-2 flex items-center"}>
            <div className={"flex flex-col items-start"}>
                <SearchableDropdown
                    options={availableOptions !== null ? options : null}
                    size={"small"}
                    selected={value}
                    onChange={setValue}
                    onSelect={(v: string) => {
                        addItem(v);
                        setValue("");
                        setWritingItem(false)
                    }}
                />
            </div>
            <IconButton
                size={"small"}
                color={color}
                onClick={() => {
                    addItem(value);
                    setValue("");
                    setWritingItem(false)
                }}
                disabled={value.length == 0}
                sx={{borderRadius: 0}}
            >
                <CheckIcon fontSize={16}/>
            </IconButton>
            <IconButton
                size="small"
                color={color}
                sx={{borderRadius: 0}}
                onClick={() => {
                    setValue("");
                    setWritingItem(false)
                }}
            >
                <XIcon fontSize={16}/>
            </IconButton>
        </div>
    }

    if (currentItems.length > 0) {
        return <IconButton
            sx={{borderRadius: 0}}
            size="small"
            color={color}
            onClick={() => {
                setWritingItem(true);
                setValue("")
            }}
        >
            <PlusIcon fontSize={14}/>
        </IconButton>
    } else {
        if (newItemText != null) {
            return <Button
                variant={"text"}
                startIcon={<AddIcon/>}
                color={"background"}
                onClick={() => {
                    setWritingItem(true)
                }}
                size={"small"}
            >
                <span className={"text-xs"}>
                    {newItemText}
                </span>
            </Button>
        } else {
            return <Button
                onClick={() => {
                    setWritingItem(true)
                }}
                size={"small"}
            >
                <span className={"text-xs"}>
                    Agregar
                </span>
            </Button>
        }
    }
}


export const ListEditorItem = ({item, removeItem, color}: {
    item: string, removeItem?: () => void, color: Color
}) => {
    const [hovering, setHovering] = useState(false)
    return <Button
        size={"small"}
        variant={"outlined"}
        color={darker(color)}
        hoverColor={darker(color)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={removeItem}
    >
        <div className={"flex justify-between"}>
            <div className={"text-xs"}>
                {item}
            </div>
            {hovering && removeItem != null ? <XIcon fontSize={14}/> : null}
        </div>
    </Button>
}


export const ListEditor = ({
                               newItemText,
                               options = [],
                               items,
                               setItems,
                               color = "background-dark"
                           }: {
    newItemText?: string
    options?: string[]
    items: string[]
    setItems?: (v: string[]) => void
    color?: Color
}) => {

    function removeItem(i: number) {
        return () => {
            if (setItems) setItems([...items.slice(0, i), ...items.slice(i + 1)])
        }
    }

    return <div className={"flex flex-wrap gap-1 items-center"}>
        {items.map((c, i) => {
            return <div key={i} className={""}>
                <ListEditorItem
                    color={color}
                    item={c}
                    removeItem={setItems ? removeItem(i) : undefined}
                />
            </div>
        })}
        {setItems && <div className={""}>
            <NewItem
                addItem={(c: string) => {
                    setItems([...items, c])
                }}
                availableOptions={options}
                currentItems={items}
                newItemText={newItemText}
                color={color}
            />
        </div>}
        {!setItems && items.length == 0 && <div>
            ---
        </div>}
    </div>
}