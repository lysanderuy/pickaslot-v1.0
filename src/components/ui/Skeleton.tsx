import type { HTMLAttributes } from "react";

import { cx } from "@/lib/cx";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cx("animate-pulse rounded-md bg-[#2A4A35]", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
