"use client"

import { useState } from "react";

type SelectionComponentProps = { 
    onSelection: (arg: string) => void
    options: string[]
    selected?: string
    className?: string
}

const SelectionComponent: React.FC<SelectionComponentProps> = ({ onSelection, options, selected, className="search" }) => {
  const [selectedButton, setSelectedButton] = useState(selected ? selected : options[0]);

  const handleButtonClick = (button: string) => {
    setSelectedButton(button);
    onSelection(button);
  };

  return <div className="flex w-full">
      {options.map((option, index) => {
        return <button key={index}
        className={className + " " + `${selectedButton === option ? 'selected-option' : 'not-selected-option'
          } py-2 px-4 focus:outline-none flex-1`}
        onClick={() => handleButtonClick(option)}
      >
        <span className={className + " " + (selectedButton == option ? 'selected-option-text' : 'non-selected-option-text')}>{option}</span>
      </button>
      })}
  </div>
};


export default SelectionComponent