import * as React from 'react';
import {ReactNode} from "react";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import {cn} from "@/lib/utils";


export function BaseSelect({
                               options,
                               value,
                               onChange,
                               optionNodes,
                               optionLabels,
                               label,
                               deselectOption = false,
                               triggerClassName = "",
                               itemClassName,
                               contentClassName,
                               inPortal = false,
                               size = "default"
                           }: {
    value: string
    options: string[]
    onChange: (v: string) => void
    optionNodes?: (o: string) => ReactNode
    optionLabels?: (o: string) => string
    label?: string
    triggerClassName?: string
    itemClassName?: string
    contentClassName?: string
    inPortal?: boolean
    size?: "small" | "default"
    deselectOption?: boolean
}) {

    let items = options?.map(o => ({
        value: o,
        label: optionLabels ? optionLabels(o) : o
    })) ?? []

    if (deselectOption && !items.some(i => i.value == null)) {
        items = [{value: null, label: "Seleccionar..."}, ...items]
    }

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger
                className={cn(triggerClassName,
                    size == "default" ? "text-[13px] py-[8px]" : "")}
            >
                <SelectValue placeholder={label}/>
            </SelectTrigger>
            <SelectContent
                className={cn(
                    "z-[1002]",
                    contentClassName,
                    inPortal ? "portal group" : ""
                )}
            >
                <SelectGroup>
                    {items?.map(({label, value: v}) => {
                        return <div key={v}>
                            <SelectItem
                                className={cn(itemClassName, size == "default" ? "text-[13px] py-[8px]" : "")}
                                value={v}
                            >
                                {label}
                            </SelectItem>
                        </div>
                    })}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}



