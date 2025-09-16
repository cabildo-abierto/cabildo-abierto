"use client"
import StateButton, { StateButtonProps} from "../../../../modules/ui-utils/src/state-button";


export const OptionsDropdownButton = ({...props}: StateButtonProps) => {
    return <StateButton
        color={"transparent"}
        variant={"text"}
        sx={{
            paddingX: "8px",
            paddingY: "8px",
            borderRadius: 0
        }}
        fullWidth={true}
        stopPropagation={true}
        textClassName={"whitespace-nowrap w-full px-1 uppercase text-xs"}
        {...props}
    />
}