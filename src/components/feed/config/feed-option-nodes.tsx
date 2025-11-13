import { BaseButton } from "../../layout/base/baseButton";
import {ReactNode} from "react";

export function feedOptionNodes(
    height: number = 47,
    getId: (o: string) => string = o => o,
    fontSize: string = "sm:text-[13px] text-[14px]",
    optionLabels?: (v: string) => ReactNode
) {

    // eslint-disable-next-line react/display-name
    return (o: string, isSelected: boolean) => {
        const id = getId(o)

        return <div className="text-[var(--text)]" id={id}>
            <BaseButton
                variant="default"
                letterSpacing={"0.025em"}
                className={"py-0"}
            >
                <span
                    style={{height}}
                    className={fontSize + " flex items-center whitespace-nowrap min-[500px]:mx-4 pb-1 mx-2 pt-2 font-medium border-b-[4px] " + (isSelected ? "border-[var(--text-light)] text-[var(--text)] border-b-[4px]" : "border-transparent text-[var(--text-light)]")}
                >
                    {optionLabels ? optionLabels(o) : o}
                </span>
            </BaseButton>
        </div>
    }
}