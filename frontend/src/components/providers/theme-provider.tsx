"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const DEFAULT_ACCENT_COLOR = "#CBFF3D";
const ACCENT_STORAGE_KEY = "leela-accent-color";

function isValidHex(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function applyAccentColor(color: string) {
  if (typeof document === "undefined") return;
  if (!isValidHex(color)) return;

  const root = document.documentElement;
  const { r, g, b } = hexToRgb(color);

  root.style.setProperty("--accent-color", color);
  root.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);

  // Keep shadcn/Tailwind primary colors synchronized.
  root.style.setProperty("--primary", color);
  root.style.setProperty("--sidebar-primary", color);
  root.style.setProperty("--chart-1", color);

  root.style.setProperty(
    "--ring",
    `rgba(${r}, ${g}, ${b}, 0.45)`,
  );

  root.style.setProperty(
    "--sidebar-ring",
    `rgba(${r}, ${g}, ${b}, 0.45)`,
  );
}

export function getStoredAccentColor() {
  if (typeof window === "undefined") {
    return DEFAULT_ACCENT_COLOR;
  }

  const stored = localStorage.getItem(ACCENT_STORAGE_KEY);

  return stored && isValidHex(stored)
    ? stored.toUpperCase()
    : DEFAULT_ACCENT_COLOR;
}

export function setStoredAccentColor(color: string) {
  if (!isValidHex(color)) return;

  const normalized = color.toUpperCase();

  localStorage.setItem(
    ACCENT_STORAGE_KEY,
    normalized,
  );

  applyAccentColor(normalized);
}

export function resetStoredAccentColor() {
  localStorage.removeItem(ACCENT_STORAGE_KEY);
  applyAccentColor(DEFAULT_ACCENT_COLOR);
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  React.useEffect(() => {
    applyAccentColor(getStoredAccentColor());
  }, []);

  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
