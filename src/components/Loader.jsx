import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-muted-foreground", className)} />;
}

export function CenteredLoader({ label = "Loading", className }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground", className)}>
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export function FullPageLoader({ label = "Loading" }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function OverlayLoader({ label = "Loading", className }) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 grid place-items-center bg-background/60 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        <span>{label}</span>
      </div>
    </div>
  );
}

