import {ReactNode} from "react";

type SelectionComponentProps = {
    selected?: string
    onSelection: (arg: string) => void
    options: string[]
    optionsNodes: (o: string, isSelected: boolean) => ReactNode
    className?: string
    unselectedOption?: string
    optionContainerClassName?: string
}

const SelectionComponent = ({
                                onSelection, options, selected, className = "search", optionsNodes, optionContainerClassName="w-full"
                            }: SelectionComponentProps) => {

    return <div className={className}>
        {options.map((option, index) => {
            return <div key={index} onClick={() => {
                onSelection(option)
            }} className={optionContainerClassName}>
                {optionsNodes(option, option == selected)}
            </div>
        })}
    </div>
};


export default SelectionComponent