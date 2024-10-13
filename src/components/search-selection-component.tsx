"use client"

import { ReactNode } from "react";
import InfoPanel from "./info-panel";

type SelectionComponentProps = { 
    onSelection: (arg: string) => void
    options: string[]
    selected?: string
    className?: string
    optionExpl?: (string | undefined)[]
    optionsNodes?: ReactNode[]
    infoPanelTexts?: (ReactNode | null)[]
    showExplanations: boolean
}

const SelectionComponent: React.FC<SelectionComponentProps> = ({
  onSelection, options, selected, className="search", optionExpl, optionsNodes, infoPanelTexts, showExplanations
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
        {infoPanelTexts && showExplanations && infoPanelTexts[index] && <InfoPanel iconClassName="text-[var(--accent-light)] ml-1" text={infoPanelTexts[index]}/>}
        {optionsNodes && 
          <div className={textClassName(option)+" flex flex-col px-1"}>
            <span>
              {optionsNodes[index]}
            </span>
            {infoPanelTexts && !showExplanations && infoPanelTexts[index] && <InfoPanel iconClassName="text-[var(--accent-light)] ml-1" text={infoPanelTexts[index]}/>}
            {showExplanations && <span className="text-[0.6rem] sm:text-[0.7rem] text-[var(--text-light)]">
              {option}
            </span>}
          </div>
        }
      </button>
      })}
  </div>
};


export default SelectionComponent