import { useEffect, useState, useRef } from "react";

export function useScrollNavigation() {
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number((entry.target as HTMLElement).dataset.index))
          .sort((a, b) => a - b);
        if (visible.length > 0) setCurrentVisibleIndex(visible[0]);
        setVisibleIndexes(visible);
      },
      { threshold: 0.6 }
    );

    stepsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToStep = (index: number) => {
    const target = stepsRef.current[index];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        const input = target.querySelector(
          "input, select, textarea"
        ) as HTMLElement;
        input?.focus();
      }, 600);
    }
  };

  return {
    stepsRef,
    currentVisibleIndex,
    visibleIndexes,
    scrollToStep,
  };
}
