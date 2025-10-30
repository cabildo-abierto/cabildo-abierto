"use client"

import React, {ReactNode, useEffect, useState, useCallback} from 'react'
import LoadingSpinner from "./loading-spinner"
import {BaseTextField, BaseTextFieldProps} from './base-text-field'

type BaseTextFieldWithSuggestionsProps = Omit<BaseTextFieldProps, "onChange" | "value"> & {
    options: string[] | "loading" | null
    optionViews?: ReactNode[]
    value: string
    onChange: (v: string, isSelected: boolean) => void
}

const BaseTextFieldWithSuggestions: React.FC<BaseTextFieldWithSuggestionsProps> = ({
   value,
   onChange,
   options,
   optionViews,
    ...props
}) => {
    const [filteredOptions, setFilteredOptions] = useState<string[] | null>(
        options != null && options !== "loading" ? options : null
    )
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        if (options != null && options !== "loading") {
            const filtered = options.filter((option) =>
                option.toLowerCase().includes(value.toLowerCase())
            )
            setFilteredOptions(filtered)
        } else {
            setFilteredOptions(null)
        }
    }, [options, value])

    const handleOptionSelect = useCallback((option: string) => {
        onChange(option, true)
        setShowDropdown(false)
    }, [onChange])

    const handleBlur = () => {
        setShowDropdown(false)
    }

    const handleFocus = () => {
        if (options === "loading" || (options && options.length > 0) || (filteredOptions && filteredOptions.length > 0)) {
            setShowDropdown(true)
        } else {
            setShowDropdown(false)
        }
    }

    const showContent = showDropdown && (
        options === "loading" ||
        (filteredOptions != null && filteredOptions.length > 0)
    )

    return (
        <div className="relative">
            <BaseTextField
                value={value}
                onChange={(e) => {
                    onChange(e.target.value, false)
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...props}
            />
            {showContent && (
                <div
                    className={`
                        absolute z-20 mt-1 w-full 
                        max-h-[300px] overflow-y-auto 
                        bg-[var(--background-dark)] border border-[var(--accent-dark)] 
                        custom-scrollbar group-[.portal]:bg-[var(--background-dark2)]
                    `}
                    onWheel={(e) => e.stopPropagation()}
                >
                    {options === "loading" ? (
                        <div className="py-4 flex justify-center">
                            <LoadingSpinner/>
                        </div>
                    ) : (
                        <div>
                            {filteredOptions && filteredOptions.map((option, index) => (
                                <div
                                    key={index}
                                    onMouseDown={(e) => {
                                        handleOptionSelect(option)
                                    }}
                                    role="option"
                                    aria-selected={option === value}
                                    className={`
                                        cursor-pointer px-4 py-2 text-sm 
                                        hover:bg-[var(--background-dark2)]
                                        transition-colors duration-150 group-[.portal]:hover:bg-[var(--background-dark3)]
                                    `}
                                >
                                    {optionViews && optionViews[index] !== undefined
                                        ? optionViews[index]
                                        : <span className={"text-sm"}>{option}</span>
                                    }
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default BaseTextFieldWithSuggestions