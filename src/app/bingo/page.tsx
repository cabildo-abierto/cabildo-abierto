"use client"
import { useState } from 'react';
import { Logo } from '../../components/logo';
import Image from 'next/image'
import Link from 'next/link';

const Page = () => {
    // Create state to track which buttons are toggled (green)
    const [toggledButtons, setToggledButtons] = useState(Array(100).fill(false));
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
        <div className="flex justify-between w-screen">
            <div className="hidden w-64 lg:flex items-end h-screen px-2">
                <div className="flex flex-col items-center">
                    <div className="mb-4 flex flex-col items-center text-center">
                        <Image
                            src="/smt.png"
                            width={64}
                            height={64}
                            alt="smt"
                        />
                        <span className="text-sm text-gray-800 mb-2">
                            Grupo Scout San Martín de Tours
                        </span>
                        {/*<Link href="/inicio" className="flex items-center flex-col">
                            <div className="text-sm text-gray-800 mb-2 text-center">
                                <p className="text-xs">En colaboración con</p>
                                <p>www.cabildoabierto.com.ar</p>
                            </div>
                        </Link>*/}
                    </div>
                </div>
            </div>
            <div className="p-4 flex justify-center items-center flex-col">
                <div className="flex justify-center items-center px-2">
                    <h2 
                        className="text-gray-800 hover:text-blue-600 cursor-pointer text-4xl font-bold text-center"
                        onClick={handleBingoClick}
                    >
                        Bingo!
                    </h2>
                </div>

                <div className="grid grid-cols-10 gap-2 lg:w-[600px] lg:h-[600px] mt-4">
                    {toggledButtons.map((isToggled, index) => (
                        <button
                            key={index}
                            onClick={() => toggleButton(index)}
                            className={`lg:w-12 lg:h-12 lg:text-lg rounded-3xl ${isToggled ? 'bg-green-400' : 'bg-white'}`}
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
            <div className="hidden w-64 lg:flex flex-col items-center justify-end h-screen px-4">
                <div className="text-xl text-gray-800 mb-4 flex flex-col items-center">
                    <h3 className="font-bold text-2xl">Cartones</h3>
                    <p>1 x $1000</p>
                    <p>2 x $1500</p>
                    <p>6 x $4000</p>
                </div>
            </div>
        </div>
    );
};

export default Page;
