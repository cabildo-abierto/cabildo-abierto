"use client"

import React from 'react';
import Popup from 'reactjs-popup';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';

function NeedAccountPopup({trigger, text}) {

  function children(close) { return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
      <div className="relative bg-white p-8 rounded-lg w-full max-w-md" role="alert">
        <button
            className="absolute top-2 right-2"
            onClick={close}
        >
            <CloseIcon/>
        </button>
        <p className="text-xl">{text}</p>
        <div className="flex justify-between mt-8">
          <div className="px-6">
            <Link href="/signup">
              <button className="large-btn">
                    Crear cuenta
              </button>
            </Link>
          </div>
          <div className="px-6">
            <Link href="/">
              <button className="large-btn">
                    Iniciar sesión
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )}

  return <Popup
    trigger={trigger}
    modal
    nested
  >
    {children}
  </Popup>
}

export default NeedAccountPopup;
