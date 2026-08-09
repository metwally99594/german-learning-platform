"use client";

export type FocusModeToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function FocusModeToggle({ enabled, onChange }: FocusModeToggleProps) {
  return (
    <button onClick={() => onChange(!enabled)}>
      Focus mode: {enabled ? "On" : "Off"}
    </button>
  );
}
