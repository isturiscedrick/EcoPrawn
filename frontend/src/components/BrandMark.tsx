import logo from "../assets/ecoprawn-logo.png";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 30, className = "" }: BrandMarkProps) {
  return (
    <img
      src={logo}
      alt="EcoPrawn"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ height: size, width: "auto" }}
    />
  );
}
