"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Copy, Check, Settings2, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { WidgetPreview } from "./WidgetPreview";

type WidgetConfigCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  previewUrl: string;
  children: ReactNode;
  /** Aspect ratio for preview: "chat" (tall), "banner" (wide), or custom like "16:9" */
  previewAspect?: "chat" | "banner" | string;
  /** Recommended OBS browser source size, e.g. "400x600" */
  recommendedSize?: string;
  onCopyUrl?: () => void;
};

export function WidgetConfigCard({
  title,
  description,
  icon,
  previewUrl,
  children,
  previewAspect = "chat",
  recommendedSize,
  onCopyUrl,
}: WidgetConfigCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [origin, setOrigin] = useState("");

  // Get origin on client side
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const fullUrl = origin + previewUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopyUrl?.();
  };

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                {icon}
              </div>
              <div>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Configure
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="border-t border-border/40 pt-4">
            {/* Storybook-style side-by-side layout */}
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Controls panel (left side) */}
              <div
                className={cn(
                  "flex-1 space-y-4 transition-all duration-300",
                  showPreview ? "lg:max-w-[50%]" : "lg:max-w-full"
                )}
              >
                {/* Toggle preview button (desktop) */}
                <div className="hidden items-center justify-between lg:flex">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Controls
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? (
                      <>
                        <PanelLeftClose className="h-3.5 w-3.5" />
                        Hide Preview
                      </>
                    ) : (
                      <>
                        <PanelLeft className="h-3.5 w-3.5" />
                        Show Preview
                      </>
                    )}
                  </Button>
                </div>

                {/* Config form */}
                <div className="max-h-[500px] overflow-y-auto pr-2">
                  {children}
                </div>

                {/* Generated URL */}
                <div className="rounded-md bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    OBS Browser Source URL
                  </p>
                  <code className="block break-all text-xs text-foreground/80">
                    {fullUrl}
                  </code>
                  {recommendedSize && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Recommended size: <span className="font-mono text-foreground/80">{recommendedSize}</span>
                    </p>
                  )}
                </div>

                {/* Copy URL button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="w-full sm:w-auto"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy URL
                    </>
                  )}
                </Button>
              </div>

              {/* Preview panel (right side) */}
              {showPreview && (
                <div className="flex-1 overflow-hidden rounded-lg border border-border/40 lg:max-w-[50%]">
                  <WidgetPreview
                    url={previewUrl}
                    title={`${title} Preview`}
                    aspect={previewAspect}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>

        {/* Collapsed state - show quick actions */}
        {!isOpen && (
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy URL
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        )}
      </Collapsible>
    </Card>
  );
}
