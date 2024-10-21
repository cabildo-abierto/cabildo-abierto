import Link from "next/link";
import { useUser } from "../app/hooks/user";


export const WhatsAppShareButton = () => {
    const {user} = useUser()

    const message = user ? "¡Sumate a Cabildo Abierto! Me podés encontrar como @"+user.id+"." : "¡Sumate a Cabildo Abierto!"
    const url = "https://www.cabildoabierto.com.ar"; // Replace with your website URL
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}%20${encodeURIComponent(url)}`;
  
    return (
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir por WhatsApp"
        background-
      >
        <button className="bg-[#78c966] hover:bg-[#46a332] rounded text-[var(--lightwhite)] w-64">
          <div className="py-2">
            Compartir en Whatsapp
          </div>
        </button>
      </Link>
    );
};