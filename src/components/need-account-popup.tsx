"use client"

import React from 'react';
import Link from 'next/link';

const NeedAccountPopupPanel: React.FC<any> = ({onClose}) => {
    return <>
        <p className="text-lg">Necesitás una cuenta para hacer esto.</p>
        <div className="flex justify-between mt-8">
            <div className="px-6">
              <Link href="/signup">
                <button className="large-btn scale-btn">
                      Crear cuenta
                </button>
              </Link>
            </div>
            <div className="px-6">
              <Link href="/">
                <button className="large-btn scale-btn">
                      Iniciar sesión
                </button>
              </Link>
            </div>
        </div>
    </>
}

export default NeedAccountPopupPanel;
