"use client"
import StateButton, { StateButtonProps} from "../../../../modules/ui-utils/src/state-button";


export const OptionsDropdownButton = ({...props}: StateButtonProps) => {
    return <StateButton
        color={"secondary"}
        variant={"contained"}
        sx={{
            color: "text-[var(--text)]",
            backgroundColor: "var(--background-dark)",
            '&:hover': {
                backgroundColor: 'var(--background-dark3)',
                boxShadow: 'none',
            },
            boxShadow: 'none',
            borderColor: 'var(--accent)',
            borderRadius: "4px"
        }}
        fullWidth={true}
        {...props}
        stopPropagation={true}
        textClassName={"whitespace-nowrap w-full px-1"}
    />
}