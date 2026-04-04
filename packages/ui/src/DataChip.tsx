import { type ReactNode } from "react";

/**
 * DataChip: High-contrast tags with a 30% opacity glow effect.
 */
export function DataChip({
  children,
  type = "default",
}: {
  children: ReactNode;
  type?: "major" | "minor" | "default";
}) {
  const variants = {
    major: "ui:bg-red-500/30 ui:text-red-700",
    minor: "ui:bg-secondary-container/30 ui:text-on-secondary-container",
    default: "ui:bg-surface-container-highest ui:text-on-surface-variant",
  };

  return (
    <span
      className={`ui:inline-flex ui:items-center ui:rounded-full ui:px-3 ui:py-1 ui:text-xs ui:font-bold ${variants[type]}`}
    >
      {children}
    </span>
  );
}
