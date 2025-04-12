"use client"
import { useState } from 'react';
import Image from 'next/image'


const Page = () => {
    // Create state to track which buttons are toggled (green)
    const [toggledButtons, setToggledButtons] = useState(Array(90).fill(false));
    const [showCongrats, setShowCongrats] = useState(false);

    // Toggle button color on click
    const toggleButton = (index) => {
        const updatedToggles = [...toggledButtons];
        updatedToggles[index] = !updatedToggles[index];
        setToggledButtons(updatedToggles);
    };

    // Show animation on BINGO click
    const handleBingoClick = () => {
        setShowCongrats(true);
        setTimeout(() => setShowCongrats(false), 10000); // Hide the message after 10 seconds
    };

    return (
        <div className="flex justify-between bg-gray-200 text-gray-900">
            <div className="hidden w-64 sm:flex items-end p-4">
                <div className="flex flex-col items-center">
                    <div className="flex flex-col items-center text-center">
                        <Image
                            src="/smt.png"
                            width={64}
                            height={64}
                            alt="smt"
                        />
                        <span className="text-sm text-gray-800">
                            Grupo Scout San Martín de Tours
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex mt-2 items-center justify-center flex-col">
                <div className="flex justify-center items-center px-2">
                    <div
                        className="text-gray-800 hover:text-blue-600 cursor-pointer text-4xl font-bold text-center"
                        onClick={handleBingoClick}
                    >
                        Bingo!
                    </div>
                </div>

                <div className="grid grid-cols-10 sm:w-[600px] sm:h-[600px] mt-4">
                    {toggledButtons.map((isToggled, index) => (
                        <button
                            key={index}
                            onClick={() => toggleButton(index)}
                            className={`border sm:text-2xl sm:w-12 sm:h-12 rounded-full ${isToggled ? 'bg-green-400 hover:bg-green-500' : 'bg-white hover:bg-gray-100'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>

                {/* Animation for Congrats */}
                {showCongrats && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-5xl font-extrabold text-white animate-bounce">
                            ¡Bingo! 🎉
                        </div>
                    </div>
                )}
            </div>
            <div className="hidden w-64 sm:flex flex-col items-center justify-end h-screen">
                <div className="text-xl text-gray-800 p-4 flex flex-col items-center">
                    <div className="font-bold text-2xl">Cartones</div>
                    <p>1 x $1000</p>
                    <p>2 x $1500</p>
                    <p>6 x $4000</p>
                </div>
            </div>
        </div>
    );
};

export default Page;
