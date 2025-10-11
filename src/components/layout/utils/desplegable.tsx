import { ReactNode, useState } from "react"

export const Desplegable = ({
    text,
    btn,
    btnOpen
}: {
    text: ReactNode;
    btn: ReactNode;
    btnOpen: ReactNode;
}) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex flex-col items-center">
            <div
                className="cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                {open ? btnOpen : btn}
            </div>
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                {text}
            </div>
        </div>
    );
};
