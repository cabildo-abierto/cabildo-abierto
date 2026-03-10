import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";
import * as React from "react"
import {useState} from "react"
import {Label} from "@/components/utils/ui/label"
import {Switch} from "@/components/utils/ui/switch";
import {DateAndTimePicker} from "@/components/utils/date-and-time-picker";


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