import React, {ReactNode} from 'react';
import {
    Select as MUISelect,
    MenuItem,
    FormControl,
    InputLabel,
    OutlinedInput
} from '@mui/material';
import {darker} from "./button";
import {Color} from "./color";

export const Select = ({
                           options,
                           value,
                           onChange,
                           optionLabels,
                           optionNodes,
                           label,
                           paddingX,
                           paddingY,
                           fontSize,
                           labelShrinkFontSize,
                           textClassName,
                           backgroundColor = "background-dark",
                           borderColor = "accent-dark",
                           outlineColor = "accent-dark"
                       }: {
    options: string[];
    onChange: (v: string) => void;
    optionNodes?: (o: string) => ReactNode
    optionLabels?: (o: string) => string
    value: string;
    label?: string;
    fontSize?: string;
    labelShrinkFontSize?: string;
    textClassName?: string;
    paddingY?: number;
    paddingX?: number;
    backgroundColor?: Color;
    borderColor?: Color;
    outlineColor?: Color;
}) => {
    const selectId = label ? `select-${label}` : "select";

    const paddingStyles =
        typeof paddingX === "number"
            ? {
                ".MuiSelect-select": {
                    paddingY: paddingY,
                    paddingX: paddingX
                },
            }
            : {};

    return (
        <FormControl fullWidth variant="outlined" size="small">
            {label && (
                <InputLabel
                    id={selectId}
                    shrink
                    sx={{
                        fontSize: fontSize,
                        "&.MuiInputLabel-shrink": {fontSize: labelShrinkFontSize},
                        "&.Mui-focused": {
                            color: "var(--text)"
                        },
                        color: "var(--text)"
                    }}
                >
                    {label}
                </InputLabel>
            )}
            <MUISelect
                value={value}
                onChange={(e) => onChange(e.target.value as string)}
                label={label}
                labelId={selectId}
                fullWidth
                input={
                    <OutlinedInput
                        notched
                        label={label}
                        sx={{
                            borderRadius: 0,
                            border: "1px",
                            fontSize: fontSize,
                            backgroundColor: `var(--${backgroundColor})`,
                            ...paddingStyles,
                            '& .MuiOutlinedInput-notchedOutline': borderColor
                                ? {
                                    borderColor: `var(--${borderColor})`,
                                    borderWidth: "1px"
                                }
                                : {
                                    border: "none",
                                },
                            '&:hover .MuiOutlinedInput-notchedOutline': borderColor
                                ? {
                                    borderColor: `var(--${borderColor})`,
                                    borderWidth: "1px"
                                }
                                : {
                                    border: "none",
                                },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': borderColor
                                ? {
                                    borderColor: `var(--${outlineColor})`,
                                    borderWidth: "1px"
                                }
                                : {
                                    border: "none",
                                },
                        }}
                    />
                }
                MenuProps={{
                    transitionDuration: 0,
                    disableScrollLock: true,
                    PaperProps: {
                        sx: {
                            backgroundColor: `var(--${backgroundColor})`,
                            paddingTop: 0,
                            marginTop: "2px",
                            paddingBottom: 0,
                            boxShadow: "none",
                            borderWidth: "1px",
                            borderRadius: 0,
                            borderColor: "var(--accent-dark)"
                        },
                        elevation: 0
                    },
                }}
            >
                {options.map((o, i) => (
                    <MenuItem
                        key={i}
                        value={o}
                        sx={{
                            backgroundColor: `var(--${backgroundColor})`,
                            "&.Mui-selected": {
                                backgroundColor: `var(--${backgroundColor})`,
                            },
                            "&.Mui-selected:hover": {
                                backgroundColor: `var(--${darker(backgroundColor)})`,
                            },
                            "&:hover": {
                                backgroundColor: `var(--${darker(backgroundColor)})`,
                            },
                        }}
                    >
                        {optionNodes ?
                            optionNodes(o) :
                            optionLabels ?
                                <span style={{fontSize}} className={textClassName}>{optionLabels(o)}</span> :
                                <span style={{fontSize}} className={textClassName}>{o}</span>
                        }
                    </MenuItem>
                ))}
            </MUISelect>
        </FormControl>
    );
};
