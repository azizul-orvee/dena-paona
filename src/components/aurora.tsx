import { cn } from "@/lib/utils";

/**
 * Ambient background: three slow-drifting colour fields over a fine grid.
 * Purely decorative and CSS-driven, so it costs nothing on the main thread
 * and disappears entirely under prefers-reduced-motion.
 */
export function Aurora({
  className,
  intensity = "full",
}: {
  className?: string;
  intensity?: "full" | "subtle";
}) {
  const scale = intensity === "subtle" ? 0.45 : 1;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 bg-ink-950" />

      <div
        className="aurora-blob absolute -left-[18%] -top-[22%] h-[62vmax] w-[62vmax] rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgb(124 92 255 / 0.30), transparent 68%)",
          opacity: 0.85 * scale,
        }}
      />
      <div
        className="aurora-blob absolute -right-[16%] top-[6%] h-[52vmax] w-[52vmax] rounded-full blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgb(35 213 200 / 0.22), transparent 68%)",
          animationDelay: "-7s",
          animationDuration: "26s",
          opacity: 0.8 * scale,
        }}
      />
      <div
        className="aurora-blob absolute bottom-[-24%] left-[24%] h-[56vmax] w-[56vmax] rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, rgb(242 69 106 / 0.16), transparent 70%)",
          animationDelay: "-14s",
          animationDuration: "30s",
          opacity: 0.75 * scale,
        }}
      />

      {/* Grid + vignette keep the gradients from feeling like a screensaver */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 0.028) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.028) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 100% 70% at 50% 0%, #000 35%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 100% 70% at 50% 0%, #000 35%, transparent 78%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 0%, transparent 30%, rgb(5 6 10 / 0.75) 100%)",
        }}
      />
    </div>
  );
}
