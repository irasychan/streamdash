"use client";

import { useAppStore } from "@/state/appStore";

export function useDashboardStatus() {
  const status = useAppStore((state) => state.dashboardStatus);
  const setStatus = useAppStore((state) => state.setDashboardStatus);
  const isLive = useAppStore((state) => state.isLive);
  const setIsLive = useAppStore((state) => state.setIsLive);

  return { status, setStatus, isLive, setIsLive };
}
