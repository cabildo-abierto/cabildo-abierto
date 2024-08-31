"use client"
import React, { useState } from 'react';

const DonationInput: React.FC<any> = ({onChange, oneForYou=true}) => {
  const [value, setValue] = useState('');

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
      <label htmlFor="integer-input" className="mb-2 text-lg font-medium text-gray-700">
        {"Elegí una cantidad" + (oneForYou ? " (al menos 2, una es para vos)" : "")}
      </label>
      <input
        id="integer-input"
        type="text"
        value={value}
        onChange={handleChange}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default DonationInput;