import {BaseButton} from "@/components/utils/base/base-button";
import {ReactNode} from "react";
import {cn} from "@/lib/utils";

export function feedOptionNodes(
    height: number = 47,
    getId: (o: string) => string = o => o,
    textClassName: string = "sm:text-[13px] text-[14px]",
    optionLabels?: (v: string) => ReactNode,
    buttonClassName?: string
) {

    // eslint-disable-next-line react/display-name
    return (o: string, isSelected: boolean) => {
        const id = getId(o)

        return <div className="text-[var(--text)]" id={id}>
            <BaseButton
                variant="default"
                letterSpacing={"0.025em"}
                className={cn("py-0", buttonClassName)}
            >
                <span
                    style={{height}}
                    className={cn("flex items-center whitespace-nowrap min-[500px]:mx-4 pb-1 mx-2 pt-2 font-medium border-b-[4px]", isSelected ? "border-[var(--text-light)] text-[var(--text)] border-b-[4px]" : "border-transparent text-[var(--text-light)]", textClassName)}
                >
                    {optionLabels ? optionLabels(o) : o}
                </span>
            </BaseButton>
        </div>
    }
}