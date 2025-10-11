import { Button } from "../layout/utils/button";
import {ReactNode} from "react";
import { Color } from "../layout/utils/color";

export function feedOptionNodes(
    height: number = 47,
    getId: (o: string) => string = o => o,
    fontSize: string = "sm:text-[13px] text-[14px]",
    color: Color = "transparent",
    optionLabels?: (v: string) => ReactNode
) {

    // eslint-disable-next-line react/display-name
    return (o: string, isSelected: boolean) => {
        const id = getId(o)

        return <div className="text-[var(--text)]" id={id}>
            <Button
                variant="text"
                color={color}
                sx={{
                    paddingY: 0,
                    borderRadius: 0,
                    height
                }}
            >
                <div
                    className={fontSize + " h-full flex items-center uppercase whitespace-nowrap min-[500px]:mx-4 pb-1 mx-2 pt-2 font-semibold border-b-[4px] " + (isSelected ? "border-[var(--text-light)] text-[var(--text)] border-b-[4px]" : "border-transparent text-[var(--text-light)]")}>
                    {optionLabels ? optionLabels(o) : o}
                </div>
            </Button>
        </div>
    }
}