import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "purple";

const variants: Record<BadgeVariant, string> = {
  default: "bg-copper-50 text-copper-700 border-copper/15",
  success: "bg-sage-light text-sage-dark border-sage/15",
  warning: "bg-amber-light text-amber-dark border-amber/15",
  danger:  "bg-rose-light text-rose-dark border-rose/15",
  info:    "bg-slate-light text-slate-dark border-slate/15",
  purple:  "bg-plum-light text-plum-dark border-plum/15",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-micro font-medium tracking-wide border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
