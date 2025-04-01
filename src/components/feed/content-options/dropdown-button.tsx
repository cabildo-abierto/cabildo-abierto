"use client"
import StateButton, { StateButtonProps} from "../../../../modules/ui-utils/src/state-button";


export const DropdownButton = ({...props}: StateButtonProps) => {
    return <StateButton
        color={"secondary"}
        variant={"outlined"}
        sx={{color: "text-[var(--text)]"}}
        fullWidth={true}
        {...props}
        stopPropagation={true}
        textClassName={"whitespace-nowrap w-full px-1"}
    />
}