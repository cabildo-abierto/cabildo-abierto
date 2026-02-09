import { createContext, ReactNode, useContext } from "react";
import * as React from "react";
import {ContentContextRef} from "@cabildo-abierto/utils";


const ContentContext = createContext<{
    contentRef: ContentContextRef
} | undefined>(undefined)


export const useContentContext = () => {
    const context = useContext(ContentContext);
    if (!context) {
        throw new Error("useContentContext must be used within a ContentContext")
    }
    return context
}

export const ContentContextProvider: React.FC<{ children: ReactNode, content: ContentContextRef }> = ({ children, content }) => {

    return (
        <ContentContext.Provider value={{contentRef: content}}>
            {children}
        </ContentContext.Provider>
    );
};
