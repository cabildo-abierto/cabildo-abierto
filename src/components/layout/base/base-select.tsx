import * as React from 'react';
import {ReactNode} from "react";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {cn} from "@/lib/utils";


export default function BaseSelect({
                                       options,
                                       value,
                                       onChange,
                                       optionNodes,
                                       optionLabels,
                                       label,
                                       triggerClassName = "",
                                       itemClassName,
                                       contentClassName,
    inPortal=false,
    size="default"
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
}) {
    const items = options.map(o => ({
        value: o,
        label: optionLabels ? optionLabels(o) : o
    }))

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
                    {items.map(({label, value: v}) => {
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



