import React from 'react';
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
                           label,
                           paddingX,
                           paddingY,
                           fontSize,
                           labelShrinkFontSize,
                           textClassName,
                           backgroundColor = "background-dark",
                           borderColor,
                           outlineColor
                       }: {
    options: string[];
    onChange: (v: string) => void;
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

    const borderStyles = (themeProp: string | undefined) =>
        themeProp ? `var(--${themeProp})` : undefined;

    return (
        <FormControl fullWidth variant="outlined" size="small">
            {label && (
                <InputLabel
                    id={selectId}
                    sx={{
                        fontSize: fontSize,
                        "&.MuiInputLabel-shrink": {fontSize: labelShrinkFontSize},
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
                            fontSize: fontSize,
                            backgroundColor: `var(--${backgroundColor})`,
                            ...paddingStyles,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: borderStyles(borderColor),
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: borderStyles(borderColor),
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: borderStyles(outlineColor),
                            },
                            borderRadius: 0
                        }}
                    />
                }
                MenuProps={{
                    PaperProps: {
                        sx: {
                            backgroundColor: `var(--${backgroundColor})`,
                            paddingTop: 0,
                            marginTop: "2px",
                            paddingBottom: 0,
                            boxShadow: "none",
                            borderWidth: "1px",
                            borderRadius: 0,
                            borderColor: "var(--text-lighter)"
                        },
                        elevation: 0,
                        borderRadius: 0
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
                        <span className={textClassName}>{o}</span>
                    </MenuItem>
                ))}
            </MUISelect>
        </FormControl>
    );
};

