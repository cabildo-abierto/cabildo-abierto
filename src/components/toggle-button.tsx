

type ToggleButtonProps = {
    text: string,
    className?: string
    toggled: boolean
    setToggled: (arg0: boolean) => void
}

export const ToggleButton = ({text, toggled, setToggled, className="gray-btn"}: ToggleButtonProps) => {
    return <button className={className + (toggled ? " toggled" : "")}
        onClick={() => {setToggled(!toggled)}}    
    >
        {text}
    </button>
}