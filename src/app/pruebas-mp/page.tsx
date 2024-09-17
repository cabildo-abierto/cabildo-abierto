"use client"
import React, { useEffect, useState } from 'react';
import MercadoPagoConfig, { Customer, CustomerCard, Payment, Preference } from "mercadopago";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { createPreference } from '../../actions/users';
initMercadoPago('APP_USR-1ddae427-daf5-49b9-b3bb-e1d5b5245f30');

const accessToken = "APP_USR-8751944294701489-091623-00cbcdbdbb328be11bd3e67a76ff0369-536751662"


const Page = () => {

  
    return <div className="flex flex-col items-center w-screen">

      <div className="w-64">
        <Wallet initialization={{ preferenceId: '536751662-d5197ecc-c43a-4880-8b95-37fba331233a' }} />
      </div>
      <button onClick={async () => {await createPreference()}}>
        Crear pref
      </button>
    </div>
};

export default Page;
        