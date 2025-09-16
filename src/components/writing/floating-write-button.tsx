import {WriteButtonIcon} from "../icons/write-button-icon";
import {createPortal} from "react-dom";


const FloatingWriteButton = ({onClick}: { onClick: () => void }) => {
    return createPortal(
        <div className={"fixed bottom-16 right-6 z-[1005] min-[500px]:hidden block"}>
            <div
                className={"rounded-full text-[var(--text)] border border-[var(--text-light)] bg-[var(--background-dark)] w-14 h-14 flex justify-center items-center hover:bg-[var(--primary-dark)] cursor-pointer"}
                onClick={onClick}
            >
                <WriteButtonIcon color={"inherit"}/>
            </div>
        </div>,
        window.document
    )
}


export default FloatingWriteButton