import StateButton, {StateButtonProps} from "./state-button";
import {useState} from "react";
import {BaseFullscreenPopup} from "./base-fullscreen-popup";
import {Button} from "./button";


export const WarningButton = ({handleClick, warningText="¿Estás seguro/a?", ...props}: StateButtonProps & {warningText: string}) => {
    const [open, setOpen] = useState(false)

    async function handleConfirmClick() {
        const {error} = await handleClick()
        if(!error) setOpen(false)
        return {error}
    }

    return <>
        <StateButton
            handleClick={async () => {setOpen(true); return {}}}
            {...props}
        />
        <BaseFullscreenPopup open={open} onClose={() => setOpen(false)} closeButton={false}>
            <div className={"flex flex-col items-center px-12 pt-12 pb-4 justify-between space-y-12"}>
                <div className={"text-center text-[var(--text-light)]"}>
                        {warningText}
                </div>
                <div className={"space-x-2 flex"}>
                    <Button onClick={() => {setOpen(false)}}>
                        Volver
                    </Button>
                    <StateButton {...props} handleClick={handleConfirmClick}/>
                </div>
            </div>
        </BaseFullscreenPopup>
    </>
}