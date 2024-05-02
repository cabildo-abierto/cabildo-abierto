'use client'

import { useSession } from "next-auth/react";
import { logout } from "@/actions/auth";

export default function Dashboard() {
    const { data: session, status } = useSession()

    return (
        <div className="flex flex-col items-center">
            <div className="mb-4 mt-4">
                <p className="text-lg font-semibold">Tu perfil</p>
            </div>
            <form action={logout}>
                <button
                    disabled={status === 'loading'}
                    className={`flex items-center justify-center gap-2 h-12 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 ${
                        status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {status === 'loading' ? 'Signing Out...' : 'Sign Out'}
                </button>
            </form>
        </div>
    );
}
