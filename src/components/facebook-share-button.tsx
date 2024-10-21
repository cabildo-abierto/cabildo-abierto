import Link from 'next/link';
import React from 'react';

const FacebookShareButton = () => {
  const url = "https://www.cabildoabierto.com.ar"
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <Link href={shareUrl} target="_blank" rel="noopener noreferrer">
    <button
        className="bg-[#4267B2] hover:bg-[#365899] text-white rounded w-64"
    >
        <div className="py-2">
            Compartir en Facebook
        </div>
    </button>
    </Link>
  );
};

export default FacebookShareButton;
