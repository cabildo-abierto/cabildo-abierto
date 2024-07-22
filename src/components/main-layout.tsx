import React from "react";
import Bars from "./bars";


export const ThreeColumnsLayout = ({left=null, center=null, right=null, centerWidth=800}) => {
    return <div className="flex justify-center">
        <div className="flex-1">
            {left}
        </div>
        <div className="center-column" style={{width: centerWidth}}>
            {center}
        </div>
        <div className="flex-1">
            {right}
        </div>
    </div>
}


const MainLayout = async ({children}) => {
    return <>
        <Bars/>
        <div className="mb-8">
            {children}
        </div>
    </>
};

export default MainLayout;