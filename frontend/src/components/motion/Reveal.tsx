import { useEffect, useRef, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** Progressive enhancement: content remains visible without observer support. */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      element.classList.add("ep-native-in-view");
      return;
    }

    element.style.setProperty("--ep-reveal-delay", `${Math.max(0, delay)}ms`);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        element.classList.add("ep-native-in-view");
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return <div ref={ref} className={className}>{children}</div>;
}
