import {cn} from "@/lib/utils";
import {CaretDownIcon} from "@phosphor-icons/react";


export const FeedTabOptionsButton = ({hovered, dragging, onClick, configOpen, isSelected}: {
    hovered: boolean
    dragging: boolean
    onClick: () => void
    configOpen: boolean
    isSelected: boolean
}) => {
    return <>
        <div
            className={cn("mb-[2px] rounded-full hover:bg-[var(--background-dark2)] p-[2px] cursor-pointer opacity-0", hovered && !dragging && "opacity-100", isSelected && configOpen && "opacity-100 bg-[var(--background-dark3)]")}
            onClick={(e) => {
                e.stopPropagation()
                onClick()
            }}
        >
            <CaretDownIcon/>
        </div>
    </>
}