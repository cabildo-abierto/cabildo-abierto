import Link from 'next/link';
import { Logo } from './logo';
import { PeriodoDePrueba } from './signup-form';
import { useState } from 'react';
import { newContactMail } from '../actions/users';


export const MailInput = ({onClose}: {onClose: () => void}) => {
  const [mail, updateMail] = useState("")


  async function onSend() {
    await newContactMail(mail)
    onClose()
  }

  return (
      <>
          <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
              
              <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                  <h2 className="py-4 text-lg">Mail de contacto</h2>
                  <div className="text-[var(--text-light)]">
                    Para enterarte cuando haya novedades de Cabildo Abierto
                  </div>
                  <div className="py-8">
                    <input 
                      className="border rounded p-2 w-72 bg-[var(--background)]"
                      value={mail}
                      placeholder="cosmefulanito@gmail.com"
                      onChange={(e) => {updateMail(e.target.value)}}
                    />
                  </div>
                  <div className="space-x-2">
                  <button
                    onClick={onClose}
                  className="gray-btn w-32">
                      Cancelar
                  </button>
                  <button
                    onClick={onSend}
                    className="gray-btn w-32">
                      Enviar
                  </button>
                  </div>
              </div>
          </div>
      </>
  );
};


export const Presentation: React.FC = () => {

    const [openMailInput, setOpenMailInput] = useState(false)

    return <div className="flex flex-col justify-center items-center mt-32 lg:mt-0 px-2">
      <div className="mb-16 flex lg:h-28 h-16">
        <div className="">
          <Logo className="lg:w-28 lg:h-28 h-16 w-16"/>
        </div>
        <div className="ml-4 h-full flex justify-center flex-col">
          <h1 className="lg:text-5xl text-2xl">Cabildo Abierto</h1>
          <h3 className="text-gray-600 text-lg lg:text-3xl mt-2">Discutí lo público</h3>
        </div>
      </div>
      <Link href="/articulo/Cabildo_Abierto" className="text-lg link2 mb-16">¿Qué es Cabildo Abierto?</Link>
      <PeriodoDePrueba setOpenMailInput={setOpenMailInput}/>
      {openMailInput && <MailInput onClose={() => {setOpenMailInput(false)}}/>}
    </div>
};
