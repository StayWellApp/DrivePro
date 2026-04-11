import { type ReactNode } from "react";

/**
 * ObservatoryCard: A borderless card component that transitions
 * from `surface-container-lowest` to `surface-bright` on hover.
 */
export function ObservatoryCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`ui:bg-surface-container-lowest hover:ui:bg-surface-bright ui:rounded-lg ui:p-6 ui:transition-colors ui:duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
