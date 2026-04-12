"use client";

import React, { useEffect } from 'react';

interface BrandingProviderProps {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  children: React.ReactNode;
}

export default function BrandingProvider({ primaryColor, secondaryColor, children }: BrandingProviderProps) {
  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--brand-primary', primaryColor);
    }
    if (secondaryColor) {
      document.documentElement.style.setProperty('--brand-secondary', secondaryColor);
    }
  }, [primaryColor, secondaryColor]);

  return <>{children}</>;
}
