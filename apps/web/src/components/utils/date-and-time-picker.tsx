import * as React from "react";
import {Label} from "@/components/utils/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/utils/ui/popover";
import {Button} from "@/components/utils/ui/button";
import {cn} from "@/lib/utils";
import {ChevronDownIcon} from "lucide-react";
import {Calendar} from "@/components/utils/ui/calendar";
import {BaseTextField} from "@/components/utils/base/base-text-field";

function formatTime(date: Date) {
    return date.toTimeString().split(' ')[0]
}

const yearMs = 1000 * 60 * 60 * 24 * 365

export function DateAndTimePicker({value, onChange, label, time = true, buttonClassName = "w-32"}: {
    value: Date
    onChange: (value: Date) => void
    label?: string
    time?: boolean
    buttonClassName?: string
}) {
    const [open, setOpen] = React.useState(false)

    return (
        <div className="flex gap-4">
            <div className="flex flex-col gap-1">
                {label && <Label htmlFor="date-picker" className="px-1">
                    {label}
                </Label>}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            size={"default"}
                            id="date-picker"
                            className={cn("border border-[var(--accent-dark)] justify-between font-normal", buttonClassName)}
                        >
                            {value ? value.toLocaleDateString() : new Date().toLocaleDateString()}
                            <ChevronDownIcon/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="portal group w-auto overflow-hidden p-0 z-[2000]" align="start">
                        <Calendar
                            mode="single"
                            selected={value}
                            captionLayout="dropdown"
                            startMonth={new Date(Date.now()-120*yearMs)}
                            onSelect={(date) => {
                                if (date) {
                                    const hours = value.getHours()
                                    const minutes = value.getMinutes()
                                    const seconds = value.getSeconds()
                                    date.setHours(hours, minutes, seconds, 0)
                                    onChange(date)
                                }
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            {time && <div className="flex flex-col gap-1">
                {label && <Label htmlFor="time-picker" className="px-1">
                    Hora
                </Label>}
                <BaseTextField
                    onChange={e => {
                        const timeString = e.target.value
                        const [hours, minutes, seconds] = timeString.split(':').map(Number)
                        const newDate = new Date(value)
                        newDate.setHours(hours, minutes, seconds, 0)
                        onChange(newDate)
                    }}
                    type="time"
                    value={formatTime(value)}
                    id="time-picker"
                    step="1"
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
            </div>}
        </div>
    )
}