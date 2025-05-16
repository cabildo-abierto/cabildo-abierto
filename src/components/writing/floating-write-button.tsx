import {WriteButtonIcon} from "../icons/write-button-icon";
import {createPortal} from "react-dom";
import {usePathname} from "next/navigation";


const FloatingWriteButton = ({onClick}: {onClick: () => void}) => {
    const pathname = usePathname()

    if(pathname.startsWith("/inicio") || pathname.startsWith("/perfil")){
        return createPortal(
            <div className={"fixed bottom-14 right-6 z-[1005] min-[500px]:hidden block"}>
                <div
                    className={"rounded-full bg-[var(--primary)] w-14 h-14 flex justify-center items-center hover:bg-[var(--primary-dark)] cursor-pointer"}
                    onClick={onClick}
                >
                    <WriteButtonIcon/>
                </div>
            </div>,
            window.document
        )
    }
    return null
}


export default FloatingWriteButton