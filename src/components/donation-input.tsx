"use client"
import React, { useState } from 'react';
import { useSubscriptionPrice } from '../app/hooks/subscriptions';

const DonationInput: React.FC<any> = ({onChange, oneForYou=true}) => {
  const [value, setValue] = useState('');
  const price = useSubscriptionPrice()
  
  const handleChange = (e: any) => {
      const val = e.target.value;
      if(val === ''){
        onChange(0)
        setValue(val)
      } else if(Number.isInteger(+val)){
        onChange(val)
        setValue(val)
      }
  };

  return (
    <div className="flex flex-col items-center">
      <label htmlFor="integer-input" className="mb-2 font-medium text-gray-700">
        {"Elegí una cantidad de suscripciones" + (oneForYou ? " (al menos 2, una es para vos y el resto para donar)" : "")}
      </label>
      <input
        id="integer-input"
        type="text"
        value={value}
        autoFocus={true}
        onChange={handleChange}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {price.price && <div className="text-[var(--text-light)] mt-2">Cada suscripción cuesta ${price.price.price}.</div>}

      {price.price && <div className="text-[var(--text-light)] mt-2">Total ${price.price.price * Number(value.length > 0 ? value : "0")}.</div>}
    </div>
  );
};

export default DonationInput;