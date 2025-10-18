import {useState} from "react";
import Image from 'next/image'
import {MusicNotesSimpleIcon} from "@phosphor-icons/react";


const ThreeNotes = () => {
    return <>
        <MusicNotesSimpleIcon color="var(--accent)" fontSize={32} weight={"bold"}/>
        <MusicNotesSimpleIcon color="var(--accent)" fontSize={32} weight={"bold"}/>
        <MusicNotesSimpleIcon color="var(--accent)" fontSize={32} weight={"bold"}/>
    </>
}


export const Bingo = ({musical=false}: {musical?: boolean}) => {
    const [toggledButtons, setToggledButtons] = useState(Array(musical ? 99 : 90).fill(false));
    const [showBingo, setShowBingo] = useState(false)

    const toggleButton = (index) => {
        const updatedToggles = [...toggledButtons];
        updatedToggles[index] = !updatedToggles[index];
        setToggledButtons(updatedToggles);
    };

    const handleBingoClick = () => {
        setShowBingo(true);
        setTimeout(() => setShowBingo(false), 10000); // Hide the message after 10 seconds
    }

    return (
        <div className="relative bg-[var(--background)]">
            <div className="flex mt-2 items-center justify-center flex-col">
                <div className="flex justify-center items-center space-x-8 px-2 py-2">
                    {musical && <ThreeNotes/>}
                    <div
                        className="text-[var(--text)] hover:text-[var(--text-light)] cursor-pointer text-4xl font-bold text-center"
                        onClick={handleBingoClick}
                    >
                        ¡Bingo!
                    </div>
                    {musical && <ThreeNotes/>}
                </div>

                <div className={"grid w-[600px] h-[600px] mt-4 " + (musical ? "grid-cols-9" : "grid-cols-10")}>
                    {toggledButtons.map((isToggled, index) => (
                        <button
                            key={index}
                            onClick={() => toggleButton(index)}
                            className={`border text-2xl w-12 h-12 rounded-full ${isToggled ? 'bg-green-400 hover:bg-green-500' : 'bg-[var(--background-dark)] hover:bg-[var(--background-dark2)]'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>

            </div>
            <div className="hidden min-[1080px]:block absolute right-4 bottom-4 w-64 px-4">
                <div className="text-xl mb-4 flex flex-col items-center">
                    <h3 className="font-bold text-2xl">Cartones</h3>
                    <p>1 x $1000</p>
                    <p>6 x $5000</p>
                    <h3 className="font-bold mt-2 text-2xl">Superbingo</h3>
                    <p>1 x $2000</p>
                    <p>6 x $10000</p>
                </div>
            </div>
            <div className="min-[1080px]:block absolute left-4 bottom-4 w-64 hidden px-2">
                <div className="flex flex-col items-center">
                    <div className="mb-4 flex flex-col items-center text-center">
                        <Image
                            src="/smt.png"
                            width={64}
                            height={64}
                            alt="smt"
                        />
                        <span className="text-sm mb-2 max-w-32 text-center">
                            Grupo Scout San Martín de Tours
                        </span>
                    </div>
                </div>
            </div>
            {showBingo && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-5xl font-extrabold text-white animate-bounce">
                        ¡Bingo! 🎉
                    </div>
                </div>
            )}
        </div>
    )
}