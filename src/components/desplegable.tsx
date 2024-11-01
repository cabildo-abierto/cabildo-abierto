import { ReactNode, useState } from "react"



export const Desplegable = ({text, btn, btnOpen}: {text: ReactNode, btn: ReactNode, btnOpen: ReactNode}) => {
    const [open, setOpen] = useState(false)

    return <div className="flex flex-col items-center">
        <div className="cursor-pointer" onClick={() => {setOpen(!open)}}>
            {open ? btnOpen : btn}
        </div>
        {open && <div>
            {text}
        </div>}
    </div>
}