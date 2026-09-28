"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { Mark } from "@/components/brand";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center bg-ink-950 px-5">
      <div className="text-center">
        <Mark className="mx-auto h-14 w-14 opacity-80" />
        <h1 className="mt-7 font-display text-[1.75rem] font-600 tracking-tight">
          Something went sideways
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-fg-muted">
          The page couldn&apos;t load. Your data is untouched — try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-linear-to-br from-brand-400 to-brand-600 px-6 py-3 text-[0.9375rem] font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
