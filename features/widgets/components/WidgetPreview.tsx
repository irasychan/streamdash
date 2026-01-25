"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui/cn";

type WidgetPreviewProps = {
  url: string;
  title: string;
  /** Default aspect ratio - "chat" (9:16), "banner" (4:1), or custom like "16:9" */
  aspect?: "chat" | "banner" | string;
  className?: string;
};

export function WidgetPreview({
  url,
  title,
  aspect = "chat",
  className,
}: WidgetPreviewProps) {
  const [key, setKey] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Calculate aspect ratio padding
  const getAspectPadding = () => {
    if (aspect === "chat") return "150%"; // 2:3 ratio (tall)
    if (aspect === "banner") return "25%"; // 4:1 ratio (wide)
    // Parse custom ratio like "16:9"
    const [w, h] = aspect.split(":").map(Number);
    if (w && h) return `${(h / w) * 100}%`;
    return "56.25%"; // Default 16:9
  };

  const handleRefresh = () => {
    setKey((k) => k + 1);
  };

  const handleOpenExternal = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Preview toolbar */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          Live Preview
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRefresh}
            title="Refresh preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleOpenExternal}
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview container with checkered background */}
      <div
        className={cn(
          "widget-preview-bg relative overflow-hidden transition-all duration-300",
          isExpanded ? "h-[500px]" : "h-auto"
        )}
      >
        {/* Aspect ratio container (only when not expanded) */}
        <div
          className={cn(isExpanded ? "h-full" : "relative w-full")}
          style={!isExpanded ? { paddingBottom: getAspectPadding() } : undefined}
        >
          <iframe
            ref={iframeRef}
            key={key}
            src={url}
            title={title}
            className={cn(
              "border-0 bg-transparent",
              isExpanded
                ? "h-full w-full"
                : "absolute inset-0 h-full w-full"
            )}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    </div>
  );
}
