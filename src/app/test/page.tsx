"use client"
import dayjs from "dayjs";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";


export default function Page() {
    return <div className={"mt-16 ml-16"}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <DatePicker
                label={"Fecha"}
                minDate={dayjs("1000-01-01")}
                format="DD/MM/YYYY"
                sx={{
                    "& .MuiInputLabel-root": {
                        color: `var(--text-lighter)`,
                    },
                    "& .MuiPickersInputBase-root": {
                        borderRadius: 0,
                        "&:hover fieldset": {
                            borderColor: `var(--text-lighter)`,
                        },
                        "& fieldset": {
                            borderRadius: 0,
                            borderColor: `var(--text-lighter)`,
                            borderWidth: 1,
                        },
                        "&.Mui-focused fieldset": {
                            borderWidth: 1,
                            borderRadius: 0,
                            "&.MuiPickersOutlinedInput-notchedOutline": {
                                borderColor: `var(--text-lighter)`
                            }
                        },
                    },
                }}
                slotProps={{
                    textField: {
                        size: "small",
                    },
                }}
            />
        </LocalizationProvider>
    </div>
}