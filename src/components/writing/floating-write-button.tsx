import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import {createPortal} from "react-dom";
import {useLayoutConfig} from "@/components/layout/layout-config-context";


const FloatingWriteButton = ({onClick}: { onClick: () => void }) => {
    const {isMobile} = useLayoutConfig()
    return createPortal(
        <div className={"fixed bottom-16 right-6 z-[1005] " + (isMobile ? "block" : "hidden") }>
            <div
                className={"rounded-full border border-[var(--text)] bg-[var(--background-dark)] w-14 h-14 flex justify-center items-center hover:bg-[var(--primary-dark)] cursor-pointer"}
                onClick={onClick}
            >
                <WriteButtonIcon fontSize={22} color={"var(--text)"}/>
            </div>
        </div>,
        window.document
    )
}


export default FloatingWriteButton