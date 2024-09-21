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

  const buttonClassName = (option: string) => (
    className + " flex-1 " + (selected === option ? 'selected-option' : 'not-selected-option')
  )

  const textClassName = (option: string) => (
    className + " " + (selected == option ? 'selected-option-text' : 'non-selected-option-text')
  )

  return <div className={"flex w-full " + className}>
      {options.map((option, index) => {
        return <button
        key={index}
        className={buttonClassName(option)}
        onClick={() => handleButtonClick(option)}
        title={optionExpl ? optionExpl[index] : undefined}
      >
        <span className={textClassName(option)}>
          {optionsNodes ? optionsNodes[index] : option}
        </span>
      </button>
      })}
  </div>
};


export default SelectionComponent