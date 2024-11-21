
import { CustomLink as Link } from './custom-link';
import { Logo } from './logo';
import { useState } from 'react';
import { articleUrl } from './utils';
import { Button } from '@mui/material';


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


export const LogoAndSlogan = () => {
  return <div className="flex items-center flex-col mb-16">
        <div className="">
            <Logo className="lg:w-32 lg:h-32 h-20 w-20"/>
        </div>
        <div className="flex justify-center flex-col mt-8">
            <h1 className="lg:text-5xl text-4xl">Cabildo Abierto</h1>
            <div className="text-base text-gray-600 text-left lg:text-[1.29rem] text-[0.96rem] my-0 py-0 mt-2">
                El lugar donde el país se reúne a discutir.
            </div>
        </div>
    </div>
}



export const Presentation = ({loggingIn, setLoggingIn}: {loggingIn: boolean, setLoggingIn: (v: boolean) => void}) => {

    const [openThanks, setOpenThanks] = useState(false)

    return <div className="flex flex-col justify-center items-center mt-24 lg:mt-0 px-2">
      
      <LogoAndSlogan/>

      <Button onClick={() => {setLoggingIn(!loggingIn)}}
        color="primary"
        size="large"
        variant="contained"
        sx={{textTransform: "none"}}
        >
        <div className="title px-4">{loggingIn ? "Crear cuenta" : "Iniciar sesión"}</div>
      </Button>
      {false && <Link href="/inicio" className="link2 mb-16 text-[var(--text-light)] text-sm">
        Entrar como invitado/a
      </Link>}
      {openThanks && <ThanksForSubscribing onClose={() => {setOpenThanks(false)}}/>}
    </div>
};
