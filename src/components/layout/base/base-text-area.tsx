import {ReactNode} from "react";
import * as React from "react";
import {Field, FieldDescription, FieldError, FieldLabel} from "@/components/ui/field";
import {InputGroup, InputGroupAddon, InputGroupTextarea} from "@/components/ui/input-group";
import InfoPanel from "@/components/layout/utils/info-panel";
import {cn} from "@/lib/utils";

export type BaseTextFieldProps = React.ComponentProps<"textarea"> & {
    inputClassName?: string
    inputGroupClassName?: string
    startIconClassName?: string
    endIconClassName?: string
    autoComplete?: string
    startIcon?: ReactNode
    endIcon?: ReactNode
    label?: string
    description?: string
    error?: string
    id?: string
    className?: string
    info?: string
    size?: "small" | "default" | "large"
}

export const BaseTextArea = ({
                                 inputClassName,
                                 inputGroupClassName,
                                 endIconClassName,
                                 startIconClassName,
                                 rows,
                                 autoComplete = "off",
                                 className,
                                 label,
                                 error,
                                 description,
                                 startIcon,
                                 endIcon,
                                 size,
                                 info,
                                 ...props
                             }: BaseTextFieldProps) => {

    return (
        <Field className={className}>
            {label && <FieldLabel htmlFor={"input-id"} className={"px-[2px]"}>
                {label}
                {info && <InfoPanel iconFontSize={13} text={info}/>}
            </FieldLabel>}
            <InputGroup className={inputGroupClassName}>
                {startIcon && <InputGroupAddon className={startIconClassName}>
                    {startIcon}
                </InputGroupAddon>}
                <InputGroupTextarea
                    className={cn("custom-scrollbar", size == "small" ? "py-1" : (size == "large" ? "py-2 text-[15px]" : "text-sm"), inputClassName)}
                    rows={rows}
                    {...props}
                />
                {endIcon && <InputGroupAddon className={endIconClassName} align={"inline-end"}>
                    {endIcon}
                </InputGroupAddon>}
            </InputGroup>
            {description && <FieldDescription>
                Helper text
            </FieldDescription>}
            {error && <FieldError>
                Error text
            </FieldError>}
        </Field>
    )
}

/*


            sx={{
                width,
                "& .MuiOutlinedInput-root": {
                    fontSize,
                    backgroundColor: `var(--${color})`,
                    borderRadius,
                    borderColor: `var(--${borderColor})`,
                    "& input": {
                        paddingY,
                        paddingX
                    },
                    "& fieldset": {
                        borderRadius,
                        borderColor: `var(--${borderColor})`,
                        borderWidth: borderWidthNoFocus
                    },
                    "&:hover fieldset": {
                        borderColor: `var(--${borderColor})`,
                    },
                    "&.Mui-focused fieldset": {
                        borderWidth,
                        borderColor: `var(--${borderColor})`,
                    },
                },
                "& .MuiInputBase-root": {
                    paddingLeft: `${pxToNumber(paddingX) + (startIcon ? 2 : 0)}px`,
                    paddingRight: endIcon ? "3px" : paddingX
                }
            }}
            InputProps={{
                autoComplete,
                sx: {
                    fontSize,
                    borderRadius: 0
                }
            }}
            InputLabelProps={{
                shrink: true,
                sx: {
                    fontSize,
                    "&.MuiInputLabel-shrink": {
                        color: `var(--text)`
                    }
                }
            }}
 */