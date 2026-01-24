"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type DashboardStatusContextType = {
  status: string;
  setStatus: (status: string) => void;
  isLive: boolean;
  setIsLive: (isLive: boolean) => void;
};

const DashboardStatusContext = createContext<DashboardStatusContextType | null>(null);

export function DashboardStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState("Connecting...");
  const [isLive, setIsLive] = useState(false);

  return (
    <DashboardStatusContext.Provider value={{ status, setStatus, isLive, setIsLive }}>
      {children}
    </DashboardStatusContext.Provider>
  );
}

export function useDashboardStatus() {
  const context = useContext(DashboardStatusContext);
  if (!context) {
    throw new Error("useDashboardStatus must be used within DashboardStatusProvider");
  }
  return context;
}
