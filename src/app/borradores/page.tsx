import React from "react";
//import { DraftsPreview } from "../../components/drafts-preview";
import { ThreeColumnsLayout } from "../../components/three-columns";


const Drafts: React.FC = () => {

    const center = <>
        <div className="py-4 px-1"><h2>Borradores</h2></div>
        {/*<DraftsPreview/>*/}
    </>

    return <ThreeColumnsLayout center={center}/>
};

export default Drafts;

