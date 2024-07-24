import React from 'react';

function NeedSubscriptionPopupPanel({onClose}: any) {
    return <>
        <p className="text-lg">Necesitás una suscripción activa.</p>
        <div className="flex justify-center mt-8">
            <button className="large-btn" onClick={onClose}>
                Ok
            </button>
        </div>
    </>
}

export default NeedSubscriptionPopupPanel;
