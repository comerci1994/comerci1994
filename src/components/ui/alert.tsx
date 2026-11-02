import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = { error: AlertCircle, success: CheckCircle2, info: Info };

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: keyof typeof icons;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const Icon = icons[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-lg border p-3 text-sm",
        variant === "error" && "border-destructive/40 bg-destructive/10 text-destructive",
        variant === "success" && "border-success/40 bg-success/10 text-success",
        variant === "info" && "bg-muted text-foreground",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="grid gap-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-foreground/90">{children}</div>}
      </div>
    </div>
  );
}
