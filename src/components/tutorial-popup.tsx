import Link from "next/link"
import { useSearch } from "./search-context"
import { UserProps } from "../app/lib/definitions"
import { useUser } from "../app/hooks/user"
import { CloseButton } from "./close-button"
import { CloseButtonIcon } from "./icons"



export const TutorialPopup = ({onClose}: {onClose: () => void}) => {
    const {searchValue} = useSearch()
    const {user} = useUser()

    return (
        <>
        {(!user || user._count.views === 0) && searchValue.length === 0 && (
            <div className="flex justify-center space-x-2 mt-2">
                <Link className="gray-btn space-x-4" href="/articulo?i=Cabildo_Abierto">
                    <span>¿Qué es Cabildo Abierto?</span>
                    <button onClick={(e) => {e.stopPropagation(); e.preventDefault(); onClose()}} className="rounded hover:bg-[var(--primary)] m-1">
                        <CloseButtonIcon />
                    </button>
                </Link>
            </div>
        )}
        </>
    )
}
