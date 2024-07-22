"use client"

import { useState } from "react";


const SelectionComponent: React.FC<{ selectionHandler: (arg: string) => void }> = ({ selectionHandler }) => {
  const [selectedButton, setSelectedButton] = useState("users");

  const handleButtonClick = (button: string) => {
    setSelectedButton(button);
    selectionHandler(button);
  };

  return <>
      <button
        className={`${selectedButton === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          } py-2 px-4 flex-grow focus:outline-none`}
        onClick={() => handleButtonClick('users')}
      >
        Usuarios
      </button>
      <button
        className={`${selectedButton === 'contents' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          } py-2 px-4 flex-grow focus:outline-none`}
        onClick={() => handleButtonClick('contents')}
      >
        Publicaciones
      </button>
      <button
        className={`${selectedButton === 'entities' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          } py-2 px-4 flex-grow focus:outline-none`}
        onClick={() => handleButtonClick('entities')}
      >
        Entidades
      </button>
  </>
};


export default SelectionComponent