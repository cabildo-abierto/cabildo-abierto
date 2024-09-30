"use client"

import { ReactNode, useState } from "react";

type SelectionComponentProps = { 
    onSelection: (arg: string) => void
    options: string[]
    selected?: string
    className?: string
    optionExpl?: (string | undefined)[]
    optionsNodes?: ReactNode[]
}

const SelectionComponent: React.FC<SelectionComponentProps> = ({
  onSelection, options, selected, className="search", optionExpl, optionsNodes
}) => {

  const handleButtonClick = (button: string) => {
    onSelection(button);
  };

  const buttonClassName = (option: string, index: number) => (
    className + " flex-1 " + (selected === option ? 'selected-option' : 'not-selected-option') + (optionsNodes ? ((index == 0 ? " rounded-l " : "") + (index == optionsNodes.length-1 ? " rounded-r " : "")): "")
  )

  const textClassName = (option: string) => (
    className + " " + (selected == option ? 'selected-option-text' : 'non-selected-option-text')
  )

  return <div className={"flex w-full " + className}>
      {options.map((option, index) => {
        return <button
        key={index}
        className={buttonClassName(option, index)}
        onClick={() => handleButtonClick(option)}
        title={optionExpl ? optionExpl[index] : undefined}
      >
        {!optionsNodes && <span className={textClassName(option)}>
          {option}
        </span>}
        {optionsNodes && 
          <div className={textClassName(option)+" flex flex-col"}>
            <span>
              {optionsNodes[index]}
            </span>
            <span className="text-[0.7rem] text-[var(--text-light)]">
              {option}
            </span>
          </div>
        }
      </button>
      })}
  </div>
};


export default SelectionComponent