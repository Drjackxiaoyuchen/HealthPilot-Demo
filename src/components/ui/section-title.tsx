import { LucideIcon } from "lucide-react";

interface SectionTitleProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionTitle({ icon: Icon, title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={18} strokeWidth={1.5} className="text-copper" />}
          <h3 className="font-serif text-[17px] font-semibold text-stone-800">{title}</h3>
        </div>
        {subtitle && <p className="text-caption text-stone-400 mt-1 ml-[30px]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
