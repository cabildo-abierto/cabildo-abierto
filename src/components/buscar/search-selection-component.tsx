import {ReactNode} from "react";

type SelectionComponentProps = {
    selected?: string
    onSelection: (arg: string) => void
    options: string[]
    optionsNodes: (o: string, isSelected: boolean) => ReactNode
    className?: string
    unselectedOption?: string
    optionContainerClassName?: string
    disabled?: boolean
}

const SelectionComponent = ({
                                onSelection,
                                options,
                                selected,
                                disabled=false,
                                className = "search",
                                optionsNodes,
                                optionContainerClassName = "w-full"
                            }: SelectionComponentProps) => {

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