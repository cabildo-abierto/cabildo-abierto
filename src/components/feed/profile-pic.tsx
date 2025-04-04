import Image from "next/image";
import { useState } from "react";
import {ModalBelow} from "../../../modules/ui-utils/src/modal-below";

export const UserSummary = ({user, className, setShowSummary}: {className?: string, user: { avatar?: string, handle: string }, setShowSummary: (bool) => void}) => {

    return (
        <div className="bg-[var(--background)] border p-2 text-sm w-48" onMouseLeave={() => setShowSummary(false)}>
            <p className="font-bold">@{user.handle}</p>
            <p>Este es un resumen del usuario.</p>
        </div>
    );
};

export const ProfilePic = ({user, className}: {className?: string, user: { avatar?: string, handle: string }}) => {
    const [anchorEl, setAnchorEl] = useState(null)
    const [showSummary, setShowSummary] = useState(false)

    return <div style={{ position: 'relative', display: 'inline-block' }}>
        <Image
            src={user.avatar ? user.avatar : "https://ui-avatars.com/api/?name=${encodeURIComponent(user.handle)}`"}
            width={100}
            height={100}
            alt={"Foto de perfil de " + user.handle}
            className={className}
            onMouseEnter={(e) => {setShowSummary(true); setAnchorEl(e.target)}}
            onMouseLeave={(e) => {setShowSummary(false)}}
        />
        <ModalBelow
            anchorEl={anchorEl}
            open={showSummary}
            onClose={() => {setShowSummary(false)}}
            hoverOnly={true}
        >
            <UserSummary user={user} className={className} setShowSummary={setShowSummary}/>
        </ModalBelow>
    </div>
}
