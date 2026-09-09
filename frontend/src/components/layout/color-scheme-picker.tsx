"use client";

import * as React from "react";
import { Check, Palette, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DEFAULT_ACCENT_COLOR,
  getStoredAccentColor,
  resetStoredAccentColor,
  setStoredAccentColor,
} from "@/components/providers/theme-provider";

function isValidHex(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function ColorSchemePicker() {
  const [open, setOpen] = React.useState(false);
  const [color, setColor] = React.useState(DEFAULT_ACCENT_COLOR);
  const [draftColor, setDraftColor] =
    React.useState(DEFAULT_ACCENT_COLOR);

  React.useEffect(() => {
    const stored = getStoredAccentColor();

    setColor(stored);
    setDraftColor(stored);
  }, []);

  function handleColorChange(value: string) {
    const normalized = value.toUpperCase();

    setDraftColor(normalized);

    if (isValidHex(normalized)) {
      setColor(normalized);
      setStoredAccentColor(normalized);
    }
  }

  function handleHexChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    let value = event.target.value.toUpperCase();

    if (!value.startsWith("#")) {
      value = `#${value}`;
    }

    setDraftColor(value);

    if (isValidHex(value)) {
      setColor(value);
      setStoredAccentColor(value);
    }
  }

  function handleReset() {
    resetStoredAccentColor();

    setColor(DEFAULT_ACCENT_COLOR);
    setDraftColor(DEFAULT_ACCENT_COLOR);
  }

  function handleApply() {
    if (!isValidHex(draftColor)) {
      setDraftColor(color);
      return;
    }

    const normalized = draftColor.toUpperCase();

    setColor(normalized);
    setDraftColor(normalized);
    setStoredAccentColor(normalized);
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Colour scheme"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full border border-[#262626] bg-[#141414] text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white"
      >
        <Palette
          className="h-4 w-4"
          style={{ color }}
        />
      </Button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close colour scheme picker"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-[#2A2A2A] bg-[#111111] p-4 shadow-2xl shadow-black/50">
            <div className="mb-4">
              <p className="text-sm font-semibold text-white">
                Colour scheme
              </p>

              <p className="mt-1 text-xs text-[#777]">
                Change the global accent colour.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#262626] bg-[#0D0D0D] p-3">
              <input
                type="color"
                value={
                  isValidHex(draftColor)
                    ? draftColor
                    : color
                }
                onChange={(event) =>
                  handleColorChange(event.target.value)
                }
                aria-label="Choose accent colour"
                className="h-12 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />

              <div className="min-w-0 flex-1">
                <label
                  htmlFor="accent-hex"
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666]"
                >
                  HEX
                </label>

                <input
                  id="accent-hex"
                  value={draftColor}
                  onChange={handleHexChange}
                  maxLength={7}
                  spellCheck={false}
                  className="h-9 w-full rounded-lg border border-[#2A2A2A] bg-[#141414] px-3 font-mono text-sm text-white outline-none transition-colors focus:border-[var(--accent-color)]"
                  placeholder="#CBFF3D"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#262626] bg-[#0D0D0D] p-3">
              <div
                className="h-8 w-8 shrink-0 rounded-lg border border-white/10"
                style={{ backgroundColor: color }}
              />

              <div className="min-w-0">
                <p className="text-xs text-[#666]">
                  Current accent
                </p>

                <p className="font-mono text-sm text-white">
                  {color}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                onClick={handleApply}
                className="flex-1 rounded-xl text-black"
                style={{
                  backgroundColor: color,
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                Apply
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="rounded-xl border-[#2A2A2A] bg-transparent text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-white"
                title="Reset to default"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
