import { ToggleButtonGroup } from "@mui/material"
import { ToggleButton as MuiToggleButton } from "@mui/material"

type ToggleButtonProps = {
    text: string,
    className?: string
    toggled: boolean
    setToggled: (arg0: boolean) => void
    toggledText?: string
    disabled?: boolean
    title?: string
}

export const ToggleButton = ({
    text,
    toggled,
    setToggled,
    className="gray-btn",
    toggledText,
    disabled=false,
    title}: ToggleButtonProps) => {

    /*return <ToggleButtonGroup
      value={toggled ? "toggled" : null}
      exclusive
      onChange={(e, newValue) => {console.log(newValue); setToggled(!toggled)}}
    >
      <MuiToggleButton
        value="toggled"
        size="small"
        sx={{textTransform: "none"}}
        >
        {(toggled && toggledText !== undefined) ? toggledText : text}
      </MuiToggleButton>
    </ToggleButtonGroup>*/

    return <button className={className + (toggled ? " toggled" : "")}
        onClick={() => {setToggled(!toggled)}}
        disabled={disabled}
        title={title}
    >
        {(toggled && toggledText !== undefined) ? toggledText : text}
    </button>
}