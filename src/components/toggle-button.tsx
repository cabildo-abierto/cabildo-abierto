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
    className="",
    toggledText,
    disabled=false,
    title}: ToggleButtonProps) => {

    return <button className={className + (toggled ? " toggled" : "")}
        onClick={() => {setToggled(!toggled)}}
        disabled={disabled}
        title={title}
    >
        {(toggled && toggledText !== undefined) ? toggledText : text}
    </button>
}