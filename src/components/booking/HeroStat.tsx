import { tw } from "@/lib/ui/tokens";

interface HeroStatProps {
  label: string;
  value: string;
  accent?: string;
}

export function HeroStat({ label, value, accent }: HeroStatProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={tw.heroStatLabel}>{label}</span>
      <span className="text-[17px] font-extrabold tracking-[-0.02em] text-[#F0F7F2]">
        {value} {accent && <em className="not-italic text-[#4ADE80]">{accent}</em>}
      </span>
    </div>
  );
}
