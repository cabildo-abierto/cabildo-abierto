import {ReactNode} from "react";
import * as React from "react";
import {Field, FieldDescription, FieldError, FieldLabel} from "@/components/ui/field";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import InfoPanel from "@/components/layout/utils/info-panel";
import {cn} from "@/lib/utils";

export type BaseTextFieldProps = Omit<React.ComponentProps<"input">, "size"> & {
    autoComplete?: string
    startIcon?: ReactNode
    endIcon?: ReactNode
    label?: string
    description?: string
    error?: string
    id?: string
    className?: string
    inputGroupClassName?: string
    inputClassName?: string
    info?: string
    startIconClassName?: string
    endIconClassName?: string
    size?: "default" | "small" | "large"
}

export const BaseTextField = ({
                                  autoComplete = "off",
                                  className,
                                  inputClassName,
                                  inputGroupClassName,
                                  startIconClassName,
                                  endIconClassName,
                                  label,
                                  error,
                                  description,
                                  startIcon,
                                  endIcon,
                                  info,
    size,
    autoFocus=false,
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
                <InputGroupInput
                    className={cn(inputClassName, size == "small" ? "py-1" : size == "large" ? "py-2 text-[15px]" : "")}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    {...props}
                />
                {endIcon && <InputGroupAddon className={endIconClassName} align={"inline-end"}>
                    {endIcon}
                </InputGroupAddon>}
            </InputGroup>
            {description && <FieldDescription>
                {description}
            </FieldDescription>}
            {error && <FieldError>
                {error}
            </FieldError>}
        </Field>
    )
}