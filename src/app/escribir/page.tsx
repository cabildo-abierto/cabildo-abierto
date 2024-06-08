"use client"

import React, {useState} from "react";
import TextareaAutosize from 'react-textarea-autosize';
import { createPost, createDiscussion } from '@/actions/create-comment'
import {useRouter} from "next/navigation";
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';

export const QuillEditor = dynamic(() => import('react-quill'), { ssr: false });

export const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    ['link', 'image'],
    ['clean'],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const SelectionComponent: React.FC<{ selectionHandler: (arg: string) => void }> = ({ selectionHandler }) => {
    const [selectedButton, setSelectedButton] = useState("publicacion");
  
    const handleButtonClick = (button: string) => {
      setSelectedButton(button);
      selectionHandler(button);
    };
  
    return (
      <div className="flex justify-center mt-8">
        <button
          className={`${
            selectedButton === 'publicacion' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          } py-2 px-4 rounded-l flex-grow focus:outline-none`}
          onClick={() => handleButtonClick('publicacion')}
        >
          Publicación
        </button>
        <button
          className={`${
            selectedButton === 'discusion' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
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
    const [placeholder, setPlaceholder] = useState('Escribí lo que quieras.');
    const [selectedButton, setSelectedButton] = useState("publicacion");
    const router = useRouter();

    const handleContentChange = (value: string) => {
        setContent(value);
    };

    const handleCreate = async () => {
        console.log("Creando publicacion con contenido")
        console.log(content)
        if(selectedButton == "publicacion"){
          const success = await createPost(content)
          if(success) {
              router.push("/")
          }
        } else {
          const success = await createDiscussion(content)
          if(success) {
              router.push("/")
          }
        }
    }

    const handleSelection = (button: string) => {
        if(button == "discusion"){
            setSelectedButton("discusion")
            setPlaceholder("Planteá una pregunta.")
        } else {
            setSelectedButton("publicacion")
            setPlaceholder("Publicá lo que quieras.")
        }
    }
      
    return (
        <div className="flex justify-center h-screen">
            <div className="flex flex-col w-full px-5">
                <div className="mb-4">
                <SelectionComponent selectionHandler={handleSelection}/>
                </div>
                <div>
                <QuillEditor modules={modules} onChange={(value) => {setContent(value)}} theme="snow"/>
                </div>
                <div className="flex justify-between mt-3">
                    <button onClick={() => router.push("/feed")}
                            className="bg-gray-200 hover:bg-gray-300 transition duration-200 font-bold py-2 px-4 rounded">
                        Volver
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={content.length === 0}
                        className={`py-2 px-4 rounded font-bold transition duration-200 ${
                            content.length === 0 ? "bg-gray-200 text-gray-500" : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
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

