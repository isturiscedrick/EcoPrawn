import Image from "next/image";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 30, className = "" }: BrandMarkProps) {
  return (
    <Image
      src="/assets/ecoprawn-logo.png"
      alt="EcoPrawn"
      width={size * 3}
      height={size * 3}
      className={`object-contain ${className}`}
      style={{ height: size, width: "auto" }}
      priority
    />
  );
}
