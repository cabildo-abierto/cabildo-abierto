"use client"

import React, { useState } from "react";
import { createPost, createDiscussion } from '@/actions/create-comment'
import { useRouter } from "next/navigation";
import MyEditor from "./editor"



const SelectionComponent: React.FC<{ selectionHandler: (arg: string) => void }> = ({ selectionHandler }) => {
  const [selectedButton, setSelectedButton] = useState("publicacion");

  const handleButtonClick = (button: string) => {
    setSelectedButton(button);
    selectionHandler(button);
  };

  return (
    <div className="flex justify-center mt-8">
      <button
        className={`${selectedButton === 'publicacion' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          } py-2 px-4 rounded-l flex-grow focus:outline-none`}
        onClick={() => handleButtonClick('publicacion')}
      >
        Publicación
      </button>
      <button
        className={`${selectedButton === 'discusion' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          } py-2 px-4 rounded-r flex-grow focus:outline-none`}
        onClick={() => handleButtonClick('discusion')}
      >
        Discusión
      </button>
    </div>
  );
};

const Escribir: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedButton, setSelectedButton] = useState("publicacion");
  const router = useRouter();

  const handleCreate = async () => {
    console.log("Creando publicacion con contenido")
    console.log(content)
    if (selectedButton == "publicacion") {
      const success = await createPost(content)
      if (success) {
        router.push("/")
      }
    } else {
      const success = await createDiscussion(content)
      if (success) {
        router.push("/")
      }
    }
  }

  const handleSelection = (button: string) => {
    console.log("Handling selection " + button)
    if (button == "discusion") {
      setSelectedButton("discusion")
    } else {
      setSelectedButton("publicacion")
    }
  }

  const isEmpty = (value) => {
      return value.length == 1 && value[0].children.length == 1 && value[0].children[0].text.length == 0
  }

  return (
    <div className="flex justify-center h-screen">
      <div className="flex flex-col w-full px-5">
        <div className="mb-4">
          <SelectionComponent selectionHandler={handleSelection} />
        </div>
        <div className="">
          {selectedButton == "publicacion" ?
            <MyEditor
              placeholder={"Publicá lo que quieras."}
              onChange={setContent}
              minHeight="6em"
            /> : <></>}
          {selectedButton == "discusion" ? 
            <MyEditor
              placeholder={"Preguntá lo que quieras."}
              onChange={setContent}
              minHeight="6em"
            /> : <></>
          }
        </div>
        <div className="flex justify-between mt-3">
          <button onClick={() => router.push("/feed")}
            className="bg-gray-200 hover:bg-gray-300 transition duration-200 font-bold py-2 px-4 rounded">
            Volver
          </button>
          <button
            onClick={handleCreate}
            disabled={isEmpty(content)}
            className={`py-2 px-4 rounded font-bold transition duration-200 ${isEmpty(content) ? "bg-gray-200 text-gray-500" : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
              }`}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Escribir;

