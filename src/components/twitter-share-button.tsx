
import { CustomLink as Link } from './custom-link';
import React from 'react';
import { useUser } from '../app/hooks/user';

const XShareButton = () => {
    const {user} = useUser()
    const url = "https://www.cabildoabierto.com.ar"

    const text = user ? "Me pueden encontrar en Cabildo Abierto como @"+user.id+". Es como Twitter, pero argentina, sin bots, y mucho mejor." : 
    "Los invito a sumarse a Cabildo Abierto. Es como Twitter, pero argentina, sin bots, y mucho mejor."
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

    return (
        <Link href={shareUrl} target="_blank" rel="noopener noreferrer">
        <button
            className="hover:bg-gray-900 bg-gray-800 text-white rounded w-64 border-b-2 border-r-2 hover:border-black border-gray-900"
        >
            <div className="py-2">
                Compartir en X (Twitter)
            </div>
        </button>
        </Link>
    )
};

export default XShareButton;
