import Link from 'next/link';
import { Logo } from './logo';
import { PeriodoDePrueba } from './signup-form';
import { useState } from 'react';
import { newContactMail } from '../actions/users';


export const ThanksForSubscribing = ({onClose}: {onClose: () => void}) => {

  return (
      <>
          <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
              <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                  <div className="text-lg mb-16">
                      ¡Gracias! Cuando haya novedades te escribimos.
                  </div>
                  <button
                    onClick={onClose}
                  className="gray-btn w-32">
                      Aceptar
                  </button>
              </div>
          </div>
      </>
  );
};


export const ContactMailInput = ({onClose}: {onClose: (accept: boolean) => void}) => {
  const [mail, updateMail] = useState("")


  async function onSend() {
    await newContactMail(mail)
    onClose(true)
  }

  return (
      <>
          <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
              
              <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                  <h2 className="py-4 text-lg">Mail de contacto</h2>
                  <div className="text-[var(--text-light)]">
                    Para enterarte cuando haya novedades de Cabildo Abierto.
                  </div>
                  <div className="py-8">
                  <input
                      className="custom-input bg-[var(--background)]"
                      placeholder=""
                      type="email"
                      id="email"
                      name="email"
                      value={mail}
                      autoFocus={true}
                      defaultValue=''
                      onChange={(e) => {updateMail(e.target.value)}}
                  />
                  </div>
                  <div className="space-x-2">
                  <button
                    onClick={() => {onClose(false)}}
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
    const [openThanks, setOpenThanks] = useState(false)

    return <div className="flex flex-col justify-center items-center mt-32 lg:mt-0 px-2">
      <div className="mb-16 flex lg:h-28 h-16">
        <div className="">
          <Logo className="lg:w-28 lg:h-28 h-16 w-16"/>
        </div>
        <div className="ml-4 flex h-full justify-center flex-col">
          <h1 className="lg:text-5xl text-3xl">Cabildo Abierto</h1>
          <h3 className="text-gray-600 text-xl lg:text-3xl mt-2">Discutí lo público</h3>
        </div>
      </div>
      <Link href="/articulo/Cabildo_Abierto" className="text-lg title mb-16 gray-btn">
        <div className="m-1">¿Qué es Cabildo Abierto?</div>
      </Link>
      <PeriodoDePrueba setOpenMailInput={setOpenMailInput}/>
      {openMailInput && <ContactMailInput onClose={(accept: boolean) => {setOpenMailInput(false); if(accept) setOpenThanks(true)}}/>}
      {openThanks && <ThanksForSubscribing onClose={() => {setOpenThanks(false)}}/>}
    </div>
};
