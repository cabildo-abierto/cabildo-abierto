"use client"
import StateButton, { StateButtonProps} from "../utils/state-button";


export const OptionsDropdownButton = ({...props}: StateButtonProps) => {
    return <StateButton
        color={"background-dark"}
        variant={"text"}
        sx={{
            paddingX: "8px",
            paddingY: "8px"
        }}
        fullWidth={true}
        stopPropagation={true}
        textClassName={"whitespace-nowrap w-full px-1 uppercase text-xs"}
        {...props}
    />
}