'use client'

import LoadingButton from '@mui/lab/LoadingButton'
import { useFormStatus } from 'react-dom'


export function LoginButton() {
    const {pending} = useFormStatus()

    return (
        <LoadingButton
            type="submit"
            fullWidth={true}
            loading={pending}
            variant="contained"
            sx={{textTransform: "none"}}
            disableElevation={true}
        >
            <div className="py-1 w-full title">
                Iniciar sesión
            </div>
        </LoadingButton>
    )
}