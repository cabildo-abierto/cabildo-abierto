import { Button } from "@mui/material"
import Link from "next/link"



export const IrAlInicioButton = () => {
    return <Link href="/">
        <Button
            variant="contained"
            sx={{textTransform: "none"}}
            disableElevation={true}
        >
            Ir al inicio
        </Button>
    </Link>
}