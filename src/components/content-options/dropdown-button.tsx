"use client"
import StateButton, { StateButtonProps} from "../ui-utils/state-button";


export const DropdownButton = ({...props}: StateButtonProps) => {
    return <StateButton
        color={"secondary"}
        variant={"outlined"}
        sx={{color: "text-[var(--text)]"}}
        fullWidth={true}
        {...props}
        stopPropagation={false}
    />
}