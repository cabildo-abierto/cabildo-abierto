import React from "react";
import Image from 'next/image';

interface WriteButtonProps {
    onClick: () => void;
}

const WriteButton: React.FC<WriteButtonProps> = ({onClick}) => {
    return (
        <div className="fixed bottom-10 right-10 p-4">
            <div className="w-40 h-40 rounded-full flex items-center justify-center overflow-hidden shadow-lg" onClick={onClick}>
                <Image
                    src="/write_logo.png"
                    alt="Write logo"
                    width={160}
                    height={160}
                    className="object-cover"
                />
            </div>
        </div>
    );
};

export default WriteButton;