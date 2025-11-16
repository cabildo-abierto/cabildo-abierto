import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";
import * as React from "react"
import {ChevronDownIcon} from "lucide-react"
import {Button} from "@/components/utils/ui/button"
import {Calendar} from "@/components/utils/ui/calendar"
import {Label} from "@/components/utils/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/utils/ui/popover"
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {Switch} from "@/components/utils/ui/switch";
import {useState} from "react";

function formatTime(date: Date) {
    return date.toTimeString().split(' ')[0]
}

export function DateAndTimePicker({value, onChange, label, time = true}: {
    value: Date
    onChange: (value: Date) => void
    label: boolean
    time?: boolean
}) {
    const [open, setOpen] = React.useState(false)

    return (
        <div className="flex gap-4">
            <div className="flex flex-col gap-1">
                {label && <Label htmlFor="date-picker" className="px-1">
                    Fecha
                </Label>}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            size={"default"}
                            variant="default"
                            id="date-picker"
                            className="w-32 border border-[var(--accent-dark)] justify-between font-normal"
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
                            onSelect={(date) => {
                                if(date) {
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


function isEmptyTime(d: Date) {
    return d.toLocaleTimeString() == "0:00:00"
}


export const DatePropEditor = ({date, setProp, propName}: {
    propName: string
    date?: Date
    setProp: (p: ArCabildoabiertoWikiTopicVersion.TopicProp) => void
}) => {
    const [time, setTime] = useState<boolean>(date && !isEmptyTime(new Date(date)))

    return <div className={"flex space-x-2 items-center"}>
        <DateAndTimePicker
            label={false}
            value={date}
            onChange={(d) => {
                setProp({
                    $type: "ar.cabildoabierto.wiki.topicVersion#topicProp",
                    name: propName,
                    value: {
                        $type: "ar.cabildoabierto.wiki.topicVersion#dateProp",
                        value: d.toISOString()
                    }
                })
            }}
            time={time}
        />
        <div className={"space-y-[2px] flex flex-col"}>
            <Label htmlFor={"switch"}>
                Hora
            </Label>
            <Switch
                id={"switch"}
                checked={time}
                onCheckedChange={(v) => {
                    setTime(v)
                    if(date) {
                        const newDate = new Date(date)
                        newDate.setHours(0, 0, 0, 0)
                        setProp({
                            $type: "ar.cabildoabierto.wiki.topicVersion#topicProp",
                            name: propName,
                            value: {
                                $type: "ar.cabildoabierto.wiki.topicVersion#dateProp",
                                value: newDate.toISOString()
                            }
                        })
                    }
                }}
            />
        </div>
    </div>
}