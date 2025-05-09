"use client"
import StateButton, { StateButtonProps} from "../../../../modules/ui-utils/src/state-button";


export const OptionsDropdownButton = ({...props}: StateButtonProps) => {
    return <StateButton
        color={"background-dark"}
        variant={"text"}
        sx={{
            paddingX: "8px",
            borderRadius: "4px"
        }}
        fullWidth={true}
        stopPropagation={true}
        textClassName={"whitespace-nowrap w-full px-1"}
        {...props}
    />
}