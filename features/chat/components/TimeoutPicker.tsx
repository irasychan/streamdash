"use client";

import { Button } from "@/components/ui/button";

type TimeoutPickerProps = {
  onTimeout: (seconds: number) => void;
};

const TIMEOUT_PRESETS = [
  { label: "1m", seconds: 60 },
  { label: "10m", seconds: 600 },
  { label: "1h", seconds: 3600 },
] as const;

export function TimeoutPicker({ onTimeout }: TimeoutPickerProps) {
  return (
    <div className="flex items-center gap-1">
      {TIMEOUT_PRESETS.map((preset) => (
        <Button
          key={preset.seconds}
          variant="ghost"
          size="sm"
          onClick={() => onTimeout(preset.seconds)}
          className="h-7 px-2 text-xs text-amber-400 hover:bg-amber-400/10 hover:text-amber-300"
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
