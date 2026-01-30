import {StateButton} from "@/components/utils/base/state-button"
import {useLogout} from "@/components/auth/logout";


export const CloseSessionButton = () => {
    const {logout} = useLogout()

    return (
        <StateButton
            variant="error"
            size="small"
            handleClick={logout}
        >
            Cerrar sesión
        </StateButton>
    )
}
