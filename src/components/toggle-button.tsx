

type ToggleButtonProps = {
    text: string,
    className?: string
    toggled: boolean
    setToggled: (arg0: boolean) => void
    toggledText?: string
}

export const ToggleButton = ({text, toggled, setToggled, className="gray-btn", toggledText}: ToggleButtonProps) => {
    return <button className={className + (toggled ? " toggled" : "")}
        onClick={() => {setToggled(!toggled)}}    
    >
        {(toggled && toggledText !== undefined) ? toggledText : text}
    </button>
}