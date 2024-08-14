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
        className={`${selectedButton === 'users' ? 'selected-search-option' : 'not-selected-search-option'
          } py-2 px-4 flex-grow focus:outline-none`}
        onClick={() => handleButtonClick('users')}
      >
        Usuarios
      </button>
      <button
        className={`${selectedButton === 'contents' ? 'selected-search-option' : 'not-selected-search-option'
          } py-2 px-4 flex-grow focus:outline-none`}
        onClick={() => handleButtonClick('contents')}
      >
        Publicaciones
      </button>
      <button
        className={`${selectedButton === 'entities' ? 'selected-search-option' : 'not-selected-search-option'
          } py-2 px-4 flex-grow focus:outline-none`}
        onClick={() => handleButtonClick('entities')}
      >
        Entidades
      </button>
  </>
};


export default SelectionComponent