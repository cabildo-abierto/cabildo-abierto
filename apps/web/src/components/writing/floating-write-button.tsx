import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import {createPortal} from "react-dom";
import {useLayoutConfig} from "../layout/main-layout/layout-config-context";


const FloatingWriteButton = ({onClick}: { onClick: () => void }) => {
    const {isMobile} = useLayoutConfig()
    return createPortal(
        <div className={"fixed bottom-16 right-6 z-[1005] " + (isMobile ? "block" : "hidden") }>
            <div
                className={"rounded-full border border-[var(--accent-dark)] bg-[var(--background-dark)] w-14 h-14 flex justify-center items-center hover:bg-[var(--background-dark2)] cursor-pointer"}
                onClick={onClick}
            >
                <WriteButtonIcon fontSize={22} color={"var(--text)"}/>
            </div>
        </div>,
        window.document
    )
}


export default FloatingWriteButton