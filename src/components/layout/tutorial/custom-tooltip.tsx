import {TooltipRenderProps} from "react-joyride";
import {CloseButtonIcon} from "@/components/layout/icons/close-button-icon";
import {IconButton} from "../../../../modules/ui-utils/src/icon-button";
import {Button} from "../../../../modules/ui-utils/src/button";

export function CustomJoyrideTooltip(props: TooltipRenderProps) {
    const {closeProps, primaryProps, step, tooltipProps} = props

    return (
        <div
            className="z-[10000] w-[300px] border-0 min-h-[150px] bg-[var(--background)] p-2" {...tooltipProps}>
            <div className={"w-full flex justify-end items-center"}>
                <IconButton
                    {...closeProps}
                    size={"small"}
                    sx={{borderRadius: 0}}
                    color={"background"}
                >
                    <CloseButtonIcon fontSize={"small"}/>
                </IconButton>
            </div>
            <div className="text-center px-4 text-sm py-8">
                {step.content}
            </div>
            <div className="flex w-full justify-end">
                <Button variant={"outlined"} color="background-dark" size={"small"} {...primaryProps}>
                    Siguiente
                </Button>
            </div>
        </div>
    );
}