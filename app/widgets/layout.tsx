"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function WidgetLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const transparent = searchParams.get("transparent") === "true";

  useEffect(() => {
    if (transparent) {
      // Add class to enable transparent backgrounds for OBS browser source
      document.documentElement.style.background = "transparent";
      document.body.classList.add("widget-transparent");

      return () => {
        document.documentElement.style.background = "";
        document.body.classList.remove("widget-transparent");
      };
    }
  }, [transparent]);

  return <>{children}</>;
}

export default function WidgetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <WidgetLayoutContent>{children}</WidgetLayoutContent>
    </Suspense>
  );
}
