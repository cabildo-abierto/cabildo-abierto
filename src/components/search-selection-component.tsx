"use client"

import { useState } from "react";
import InfoPanel from "./info-panel";

type SelectionComponentProps = { 
    onSelection: (arg: string) => void
    options: string[]
    selected?: string
}

const SelectionComponent: React.FC<SelectionComponentProps> = ({ onSelection, options, selected }) => {
  const [selectedButton, setSelectedButton] = useState(selected ? selected : options[0]);

  const handleButtonClick = (button: string) => {
    setSelectedButton(button);
    onSelection(button);
  };

  return <div className="flex w-full">
      {options.map((option, index) => {
        return <button key={index}
        className={`${selectedButton === option ? 'selected-search-option' : 'not-selected-search-option'
          } py-2 px-4 focus:outline-none flex-1`}
        onClick={() => handleButtonClick(option)}
      >
        {option}
      </button>
      })}
  </div>
};


export default SelectionComponent