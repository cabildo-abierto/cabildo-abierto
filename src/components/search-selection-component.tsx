"use client"

import { ReactNode } from "react";
import InfoPanel from "./info-panel";
import { Button } from "@mui/material";

type SelectionComponentProps = { 
    selected?: string
    onSelection: (arg: string) => void
    options: string[]
    optionsNodes: (o: string, isSelected: boolean) => ReactNode
    className?: string
}

const SelectionComponent: React.FC<SelectionComponentProps> = ({
  onSelection, options, selected, className="search", optionsNodes
}) => {

  return <div className={"flex w-full " + className}>
      {options.map((option, index) => {
        return <div key={index} onClick={() => {onSelection(option)}} className="w-full">
            {optionsNodes(option, option==selected)}
        </div>
      })}
  </div>
};


export default SelectionComponent