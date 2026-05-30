import { tw } from "@/lib/ui/tokens";

interface HeroStatProps {
  label: string;
  value: string;
  accent?: string;
}

export function HeroStat({ label, value, accent }: HeroStatProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className={tw.heroStatLabel}>{label}</span>
      <span className="text-[13px] font-extrabold leading-tight tracking-[-0.02em] text-[#F0F7F2] sm:text-[17px] sm:leading-normal">
        {value} {accent && <em className="not-italic text-[#4ADE80]">{accent}</em>}
      </span>
    </div>
  );
}
