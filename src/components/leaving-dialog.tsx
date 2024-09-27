import Link from "next/link";

  
type LeavingDialogProps = {
isOpen: boolean;
yesCallback: () => void;
noCallback: () => void;
};



export const LeavingDialog = ({
isOpen,
yesCallback,
noCallback,
}: LeavingDialogProps) => {
    if(!isOpen) return <></>

    return (
        <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
            
            <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                <div className="py-4 text-lg">¿Estás seguro/a de que querés salir de la página? Vas a perder lo que estás escribiendo.</div>
                <div className="flex justify-center items-center py-8 space-x-4">
                    <button className="gray-btn" onClick={noCallback}>
                        Cancelar
                    </button>
                    <button className="gray-btn" onClick={yesCallback}>
                        Salir
                    </button>
                </div>
            </div>
        </div>
    );

};