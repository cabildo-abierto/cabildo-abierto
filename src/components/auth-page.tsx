"use client"
import { BlueskyLogin } from './bsky-login';
import { TopbarLogo } from './logo';


export const AuthPage = () => {
    return <div className="flex flex-col items-center h-screen justify-between">

        <div className="flex flex-col h-full items-center justify-center">
            <div className="mb-8">
            <TopbarLogo className="w-20 h-20 m-2"/>
            </div>
            <BlueskyLogin/>
        </div>
    </div>
}