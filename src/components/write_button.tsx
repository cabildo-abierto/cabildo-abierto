import React from "react";
import Image from 'next/image';
import {permanentRedirect, redirect} from "next/navigation";
import Link from "next/link";

const WriteButton: React.FC = () => {
    return (
        <div className="fixed bottom-10 right-10 p-4">
            <Link className="w-40 h-40 rounded-full flex items-center justify-center overflow-hidden shadow-lg cursor-pointer" href="/new-discussion">
                <Image
                    src="/write_logo.png"
                    alt="Write logo"
                    width={160}
                    height={160}
                    className="object-cover"
                />
            </Link>
        </div>
    );
};

export default WriteButton;