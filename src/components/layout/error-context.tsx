"use client"

import { createContext, ReactNode, useContext, useState } from "react";
import {AcceptButtonPanel} from "./dialogs/accept-button-panel";


const ErrorContext = createContext<{
    errors: string[]
    setErrors: React.Dispatch<React.SetStateAction<string[]>>
} | undefined>(undefined)

const useErrorContext = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error("useError must be used within a ErrorContext")
    }
    return context
}

export function useErrors() {
    const {errors, setErrors} = useErrorContext()

    function addError(e: string) {
        setErrors([...errors, e])
    }

    return {errors, addError}
}

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [errors, setErrors] = useState<string[]>([])

    return (
        <ErrorContext.Provider value={{errors, setErrors}}>
            {children}
            {errors.map((e, i) => <div key={`${i}:${e}`}>
                <AcceptButtonPanel
                    onClose={() => {
                        setErrors(errors.toSpliced(i))
                    }}
                    open={true}
                >
                    <div className={"font-bold text-lg"}>
                        :(
                    </div>
                    <div className={"font-light py-4 max-w-[400px]"}>
                        {e}
                    </div>
            </AcceptButtonPanel>
            </div>)}
        </ErrorContext.Provider>
    );
};
