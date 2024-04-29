"use client"

import React from "react";
import {router} from "next/client";

export default function SignUp() {
    let form_class_name = "flex w-full justify-center bg-white border border-gray-300 rounded mb-4 pl-4 pr-4"

    return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
        <h2 className="text-2xl font-semibold mb-4">Registro</h2>
        <form action="/api/register" method="POST">
            <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700">Nombre</label>
                <input type="text" id="name" name="name" required
                       className={form_class_name}/>
            </div>
            <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700">Email</label>
                <input type="email" id="email" name="email" required
                       className={form_class_name}/>
            </div>
            <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700">Contraseña</label>
                <input type="password" id="password" name="password"required className={form_class_name}/>
            </div>
            <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700">Confirmación de contraseña</label>
                <input type="password" id="confirmPassword" name="confirmPassword"
                       required className={form_class_name}/>
            </div>
            <div className="mt-6">
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Sign
                    Up
                </button>
            </div>
        </form>
    </div>
    );

}
