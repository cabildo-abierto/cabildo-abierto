"use client"

import React from 'react';

function NeedPermissionsPopupPanel({onClose}: any) {
    return <>
        <p className="text-lg">No tenés los permisos suficientes para hacer esto.</p>
        <div className="flex justify-center mt-8">
            <button className="gray-btn" onClick={onClose}>
                Ok
            </button>
        </div>
    </>
}

export default NeedPermissionsPopupPanel;



