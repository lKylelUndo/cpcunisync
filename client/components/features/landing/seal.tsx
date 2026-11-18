import Image from "next/image";

import { cn } from "@/lib/utils";

const frameSizes = {
  sm: "size-10 p-0.5",
  md: "size-14 p-1",
  lg: "size-36 p-1.5 sm:size-44 sm:p-2 lg:size-52",
} as const;

type SealSize = keyof typeof frameSizes;

// The frame reads as a struck medallion: a white mat, a thin gold ring, and a
// soft navy shadow that lifts it off the page. Sizes scale the ring weight so
// small seals stay crisp and large ones feel ceremonial.
const frameChrome: Record<SealSize, string> = {
  sm: "shadow-sm ring-1 ring-[#d9a51c]/70 dark:ring-[#f0c14b]/45",
  md: "shadow-md ring-1 ring-[#d9a51c]/75 dark:ring-[#f0c14b]/50",
  lg:
    "shadow-[0_22px_48px_-18px_rgba(16,31,78,0.55)] ring-2 ring-[#d9a51c]/80 dark:shadow-[0_26px_56px_-14px_rgba(0,0,0,0.65)] dark:ring-[#f0c14b]/55",
};

const imageSizes: Record<SealSize, string> = {
  sm: "40px",
  md: "56px",
  lg: "(max-width: 640px) 144px, (max-width: 1024px) 176px, 208px",
};

interface SealProps {
  size?: SealSize;
  preload?: boolean;
  className?: string;
}

/**
 * The official CPC seal has a white background and no transparency, so it is
 * always presented inside a white circular frame.
 */
export function Seal({ size = "md", preload = false, className }: SealProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white",
        frameSizes[size],
        frameChrome[size],
        className,
      )}
    >
      <Image
        src="/cpclogo.jpg"
        alt="Cordova Public College seal"
        width={1080}
        height={1080}
        sizes={imageSizes[size]}
        preload={preload}
        className="size-full rounded-full object-contain"
      />
    </span>
  );
}
