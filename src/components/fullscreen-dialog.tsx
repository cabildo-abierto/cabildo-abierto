import { ReactNode } from "react";
import { Dialog } from "@headlessui/react";
import { CloseButton } from "./close-button";

export const FullscreenDialog = ({
    children,
    closeButton = false,
    onClose,
    className,
    open
}: {
    children: ReactNode;
    closeButton?: boolean;
    onClose?: () => void;
    className?: string;
    open: boolean
}) => {
    return (
        <Dialog
            open={true}
            onClose={() => {
                if (onClose) onClose();
            }}
            aria-hidden="true"
            className="fixed inset-0 z-50 flex justify-center items-center w-screen h-screen touch-none" // Adds `touch-none`
        >
            <Dialog.Panel
                className="bg-white w-full h-full z-50"
                onClick={(e) => e.stopPropagation()} // Prevents click propagation to the Dialog overlay
            >
                {closeButton && (
                    <div className="flex justify-end">
                        <CloseButton onClose={onClose} />
                    </div>
                )}
                {children}
            </Dialog.Panel>
        </Dialog>
    );
};
