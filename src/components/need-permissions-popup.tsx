"use client"

import React from 'react';
import Popup from 'reactjs-popup';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';

function NeedPermissionsPopup({trigger, text}) {

  function children(close) { return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
      <div className="relative bg-white p-8 rounded-lg w-full max-w-md" role="alert">
        <button
            className="absolute top-2 right-2"
            onClick={close}
        >
            <CloseIcon/>
        </button>
        <p className="text-lg">{text}</p>
        <div className="flex justify-center mt-8">
            <button className="large-btn" onClick={close}>
                Ok
            </button>
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

export default NeedPermissionsPopup;
