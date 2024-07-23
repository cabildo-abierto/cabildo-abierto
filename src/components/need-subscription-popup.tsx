import React from 'react';
import NeedPermissionsPopup from './need-permissions-popup';

function NeedSubscriptionPopup({trigger, text}: any) {
    return <NeedPermissionsPopup trigger={trigger} text={text}/>
}

export default NeedSubscriptionPopup;
