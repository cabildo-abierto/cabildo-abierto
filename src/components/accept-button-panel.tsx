import { ReactNode } from "react";
import { useUser } from "../app/hooks/user";



export const AcceptButtonPanel = ({text, onClose}: {text: ReactNode, onClose: () => void}) => {
    const {user} = useUser()
    
    return (
        <>
            <div className="cursor-default fixed inset-0 z-10 flex justify-center items-center">
                
                <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                    {text}

                    <div className="flex justify-center mt-8">
                        <button className="gray-btn" onClick={onClose}>
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};