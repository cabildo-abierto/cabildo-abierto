import React from "react";
import Image from 'next/image';

function openWriting() {
    return;
}

const WriteButton: React.FC = () => {
    const [showInput, setShowInput] = useState(false);

    const toggleInput = () => {
        setShowInput(prevState => !prevState);
    };

    return (
        <div className="fixed bottom-10 right-10 p-4">
            <div className="w-40 h-40 rounded-full flex items-center justify-center overflow-hidden shadow-lg" onClick={toggleInput}>
                <Image
                    src="/write_logo.png"
                    alt="Write logo"
                    width={160}
                    height={160}
                    className="object-cover"
                />
            </div>
            {showInput && (
                <input
                    type="text"
                    placeholder="Enter something"
                    className="absolute bottom-0 right-0 p-2 bg-white border border-gray-300 rounded"
                />
            )}
        </div>
    );
};

export default WriteButton;