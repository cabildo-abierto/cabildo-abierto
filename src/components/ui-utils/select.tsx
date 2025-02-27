import React from 'react';
import { Select as MUISelect, MenuItem, FormControl, InputLabel } from '@mui/material';

export const Select = ({ options, value, onChange, label, fontSize }: {
    options: string[], onChange: (v: string) => void, value: string, label?: string, fontSize?: string }) => {
    const selectId = label ? `select-${label}` : 'select';

    return (
        <FormControl fullWidth variant="outlined" size="small">
            {label && <InputLabel
                id={selectId}
                sx={{
                    fontSize: "14px",
                    "&.MuiInputLabel-shrink": { fontSize: "12px" }
                }}
            >{label}
            </InputLabel>}
            <MUISelect
                value={value}
                onChange={(e) => onChange(e.target.value)}
                label={label}
                labelId={selectId}
                fullWidth
                sx={{ fontSize: fontSize,
                }}
            >
                {options.map((o, i) => (
                    <MenuItem key={i} value={o}>
                        {o}
                    </MenuItem>
                ))}
            </MUISelect>
        </FormControl>
    );
};
