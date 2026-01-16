

import {PlusIcon} from "@phosphor-icons/react";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";

export const AddThreadElementButton = ({onAddThreadElement, disabled}: {
    onAddThreadElement: () => void
    disabled?: boolean
}) => {
    return <BaseIconButton
        disabled={disabled}
        onClick={onAddThreadElement}
    >
        <PlusIcon/>
    </BaseIconButton>
}