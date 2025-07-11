import {ReactNode} from "react";

type SelectionComponentProps<T> = {
    selected?: T
    onSelection: (arg: T) => void
    options: T[]
    optionsNodes: (o: T, isSelected: boolean) => ReactNode
    className?: string
    unselectedOption?: string
    optionContainerClassName?: string
    disabled?: boolean
}

function SelectionComponent<T>({
    onSelection,
    options,
    selected,
    disabled=false,
    className = "search",
    optionsNodes,
    optionContainerClassName = "w-full"
}: SelectionComponentProps<T>) {

    return <div className={className}>
        {options.map((option, index) => {
            return <div
                key={index}
                onClick={() => {
                    if(!disabled) onSelection(option)
                }}
                className={optionContainerClassName}
            >
                {optionsNodes(option, option == selected)}
            </div>
        })}
    </div>
};


export default SelectionComponent