"use client"

import React from 'react';
import Popup from './popup';

function NeedAccountPopup({trigger, text}: any) {
  
    const panel = (close: any) => (<>
        <p className="text-lg">{text}</p>
        <div className="flex justify-center mt-8">
            <button className="large-btn" onClick={close}>
                Ok
            </button>
        </div>
    </>)

    return <Popup
      panel={panel}
      trigger={trigger}
    />
}

export default NeedAccountPopup;



