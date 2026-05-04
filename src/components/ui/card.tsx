import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}

export function Card({ children, className, accent }: CardProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 border border-cream-300 transition-shadow duration-200 hover:shadow-elevated",
      accent && "border-copper/20",
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-5", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("font-serif text-title text-stone-800", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-caption text-stone-400 mt-1", className)}>{children}</p>;
}
