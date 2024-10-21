import Link from 'next/link';
import { Logo } from './logo';
import { useState } from 'react';
import { articleUrl } from './utils';


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


export const Presentation = ({loggingIn, setLoggingIn}: {loggingIn: boolean, setLoggingIn: (v: boolean) => void}) => {

    const [openThanks, setOpenThanks] = useState(false)

    return <div className="flex flex-col justify-center items-center mt-32 lg:mt-0 px-2">
      <div className="mb-16 flex lg:h-28 h-16">
        <div className="">
          <Logo className="lg:w-28 lg:h-28 h-16 w-16"/>
        </div>
        <div className="ml-4 flex h-full justify-center flex-col">
          <h1 className="lg:text-5xl text-[1.7rem]">Cabildo Abierto</h1>
          <h2 className="text-gray-600 text-xl lg:text-3xl sm:mt-2 my-0 py-0">Discutí lo público</h2>
        </div>
      </div>
      <Link href={articleUrl("Cabildo_Abierto")} className="text-lg title mb-3 w-72 gray-btn flex justify-center text-center">
        <div className="m-1">¿Qué es Cabildo Abierto?</div>
      </Link>
      <button onClick={() => {setLoggingIn(!loggingIn)}} className="w-72 text-lg title mb-3 green-btn">
        <div className="m-1">{loggingIn ? "Crear cuenta" : "Iniciar sesión"}</div>
      </button>
      <Link href="/inicio" className="link2 mb-16 text-[var(--text-light)] text-sm">
        Entrar como invitado/a
      </Link>
      {openThanks && <ThanksForSubscribing onClose={() => {setOpenThanks(false)}}/>}
    </div>
};
