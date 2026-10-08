"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/** A score that rolls up when it changes after the first render, and sits still otherwise. */
export function TickingNumber({ value, className }: { value: number; className?: string }) {
  const [previous, setPrevious] = useState(value);
  const [changed, setChanged] = useState(false);
  if (previous !== value) {
    setPrevious(value);
    setChanged(true);
  }

  return (
    <span key={value} className={cn("inline-block", changed && "animate-score-tick", className)}>
      {value}
    </span>
  );
}
