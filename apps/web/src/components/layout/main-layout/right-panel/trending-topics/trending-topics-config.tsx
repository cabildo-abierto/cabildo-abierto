import {BaseSelect} from "@/components/utils/base/base-select";
import * as React from "react";

export const TrendingTopicsConfig = ({time, setTime, inPortal=false}: {
    time: string,
    setTime: (v: string) => void
    inPortal?: boolean
}) => {

    return <BaseSelect
        size={"small"}
        triggerClassName={"w-[80px]"}
        contentClassName={inPortal ? "group portal" : ""}
        options={["día", "semana", "mes"]}
        value={time}
        onChange={(v: string) => {
            setTime(v)
        }}
    />
}