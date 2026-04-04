"use client";

import { type ReactNode } from "react";

/**
 * IntelligencePane: A slide-over glass panel with heavy backdrop-blur.
 */
export function IntelligencePane({
  isOpen,
  onClose,
  children,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="ui:fixed ui:inset-0 ui:z-50 ui:flex ui:justify-end">
      {/* Backdrop */}
      <div
        className="ui:absolute ui:inset-0 ui:bg-black/20"
        onClick={onClose}
      />

      {/* Pane */}
      <div className="ui:relative ui:h-full ui:w-full ui:max-w-md ui:bg-surface-container-lowest/70 ui:backdrop-blur-[30px] ui:p-8 ui:shadow-ambient ui:flex ui:flex-col">
        <div className="ui:flex ui:items-center ui:justify-between ui:mb-8">
          <h2 className="ui:text-xl ui:font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="ui:p-2 ui:rounded-full hover:ui:bg-surface-container-highest ui:transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="ui:flex-1 ui:overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
