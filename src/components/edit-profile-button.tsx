"use client"
import { Button } from "@mui/material"
import { useState } from "react"



export const EditProfileButton = () => {
    const [open, setOpen] = useState(false)

    return <><Button
        size="small"
        variant="outlined"
        sx={{textTransform: "none"}}
        onClick={() => {setOpen(true)}}
    >
        Editar perfil
    </Button>
        {/* Modal */}
    </>
}