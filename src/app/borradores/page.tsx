import React from "react";
import { ThreeColumnsLayout } from "src/components/three-columns";
import { DraftsPreview } from "../../components/drafts-preview";


const Drafts: React.FC = () => {

    const center = <>
        <div className="py-4"><h1>Borradores</h1></div>
        <DraftsPreview/>
    </>

    return <ThreeColumnsLayout center={center}/>
};

export default Drafts;

