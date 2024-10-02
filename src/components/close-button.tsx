import { CloseButtonIcon } from "./icons"



export const CloseButton = ({onClose}: {onClose: () => void}) => {
    return <button onClick={onClose} className="rounded hover:bg-[var(--secondary-light)] m-1">
        <CloseButtonIcon />
    </button>
}