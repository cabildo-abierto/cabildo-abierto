"use client"

import SignupForm from "./signup-form";
import LoginForm from "./login-form"
import { Typewriter } from 'nextjs-simple-typewriter'
import Image from 'next/image'
import {useState} from "react";

export default function Home() {
    const [state, setState] = useState("signup");



    return (
        <div className="flex">
            <div className="w-3/4 px-16 py-16">
                <h1 className="text-4xl font-bold text-gray-900">Demos</h1>
                <div className="mt-4 text-2xl text-gray-700">
                    <Typewriter
                        words={["Informate", "Informá", "Discutí"]}
                        loop={0}
                        cursor
                        typeSpeed={70}
                        deleteSpeed={50}
                        delaySpeed={1000}
                    />
                </div>
                <div className="absolute left-0 top-0 -z-10">
                    <Image
                        src="/parthenon1.png"
                        alt="parthenon"
                        width={800}
                        height={800}
                    />
                </div>
            </div>
            <div className="w-1/2 flex justify-center">
                {state == "signup" && <div className="w-1/2 mr-8 py-32">
                    <SignupForm title="Creá tu cuenta" onHasAccount={() => setState("login")}/>
                </div>}
                {state == "login" && <div className="w-1/2 mr-8 py-32">
                    <LoginForm onNoAccount={() => setState("signup")} />
                </div>}
            </div>
        </div>
    );
}