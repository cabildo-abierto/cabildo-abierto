import { ReactNode } from "react";
import { Dialog } from "@headlessui/react";
import { CloseButton } from "./close-button";

export const BaseFullscreenPopup = ({
    children,
    closeButton = false,
    onClose,
    className
}: {
    children: ReactNode;
    closeButton?: boolean;
    onClose?: () => void;
    className?: string;
}) => {
    return (
        <Dialog
            open={true}
            onClose={() => {
                if (onClose) onClose();
            }}
            className="fixed inset-0 z-50 flex justify-center items-center"
        >
            <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
            <div className={"relative " + className}>
                <Dialog.Panel className="bg-white rounded border-2 border-black text-center z-50">
                    {closeButton && (
                        <div className="flex justify-end">
                            <CloseButton onClose={onClose} />
                        </div>
                    )}
                    {children}
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};
