import React from "react";
import Router from "next/router";


const Header = () => {
    return (
        <header className="bg-gray-800 text-white py-4">
            <div className="container mx-auto cursor-pointer" onClick={() => Router.push("/", `/`)}>
                <h1 className="text-2xl font-semibold">Demos</h1>
            </div>
        </header>
    );
};

export default Header