"use client"
import { useEffect } from 'react';
import {Session} from "@/lib/types";
import {useAPI} from "@/hooks/api";

const Page = () => {
    const { data: session, refetch } = useAPI<Session>("/api/session", ["session"])

    useEffect(() => {
        const channel = new BroadcastChannel("auth_channel")
        channel.postMessage("auth-success")
        channel.close()
        window.close();
    }, []);

    return (
        <div className="h-[calc(100vh-20px)] w-[calc(100vw-20px)] flex items-center justify-center text-center text-[var(--text-light)]">
            Ya podés cerrar esta ventana.
        </div>
    );
};

export default Page;
