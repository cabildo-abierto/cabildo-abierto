"use client"

import React from 'react';
import Link from 'next/link';

const NeedAccountPopupPanel: React.FC<any> = ({onClose}) => {
    return <>
        <p className="text-lg">Necesitás una cuenta para hacer esto.</p>
        <div className="flex justify-center mt-8">
            <div className="px-6">
              <Link href="/">
                <button className="gray-btn">
                    Ir al inicio
                </button>
              </Link>
            </div>
        </div>
    </>
}

export default NeedAccountPopupPanel;
