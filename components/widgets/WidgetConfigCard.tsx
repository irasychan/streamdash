"use client";

import { useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, MonitorPlay, Copy, Check, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

type WidgetConfigCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  previewUrl: string;
  children: ReactNode;
  onCopyUrl?: () => void;
};

export function WidgetConfigCard({
  title,
  description,
  icon,
  previewUrl,
  children,
  onCopyUrl,
}: WidgetConfigCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullUrl = window.location.origin + previewUrl;
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
          <CardContent className="space-y-4 border-t border-border/40 pt-4">
            {children}

            {/* Generated URL */}
            <div className="rounded-md bg-muted/30 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                OBS Browser Source URL
              </p>
              <code className="block break-all text-xs text-foreground/80">
                {previewUrl}
              </code>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={previewUrl} target="_blank" rel="noreferrer">
                  <MonitorPlay className="mr-2 h-4 w-4" />
                  Preview
                </a>
              </Button>
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
        </CollapsibleContent>

        {/* Collapsed state - show quick actions */}
        {!isOpen && (
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={previewUrl} target="_blank" rel="noreferrer">
                  <MonitorPlay className="mr-2 h-4 w-4" />
                  Preview
                </a>
              </Button>
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
