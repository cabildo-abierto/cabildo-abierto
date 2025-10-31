import {TooltipRenderProps} from "react-joyride";
import {BaseButton} from "../base/baseButton";

export function CustomJoyrideTooltip(props: TooltipRenderProps) {
    const {primaryProps, step, tooltipProps, isLastStep} = props

    return (
        <div
            className="z-[10000] w-[300px] border-0 min-h-[150px] bg-[var(--background-dark)] p-2" {...tooltipProps}
        >
            <div className="text-center px-4 text-sm py-8">
                {step.content}
            </div>
            <div className="flex w-full justify-end">
                <BaseButton
                    variant={"outlined"}
                    size={"small"}
                    {...primaryProps}
                >
                    {isLastStep ? "Finalizar" : "Siguiente"}
                </BaseButton>
            </div>
        </div>
    )
}