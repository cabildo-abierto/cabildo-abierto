"use client"

import React from 'react';
import Popup from './popup';
import Link from 'next/link';

function NeedAccountPopup({trigger, text}: any) {
  
    const panel = (close: any) => (<>
        <p className="text-lg">{text}</p>
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
    </>)

    return <Popup
      panel={panel}
      trigger={trigger}
    />
}

export default NeedAccountPopup;
