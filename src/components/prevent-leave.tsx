"use client"
import React, { createContext, useContext, useState } from "react";

type PageLeaveContextType = {
    leaveStoppers: Set<string>;
    setLeaveStoppers: React.Dispatch<React.SetStateAction<Set<string>>>;
};

const PageLeaveContext = createContext<PageLeaveContextType | undefined>(undefined);

export const PageLeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveStoppers, setLeaveStoppers] = useState(new Set<string>());

  return (
    <PageLeaveContext.Provider value={{ leaveStoppers, setLeaveStoppers }}>
      {children}
    </PageLeaveContext.Provider>
  );
};

export const usePageLeave = (): PageLeaveContextType => {
  const context = useContext(PageLeaveContext);
  if (!context) {
    throw new Error("usePageLeave must be used within a PageLeaveProvider");
  }
  return context;
};
