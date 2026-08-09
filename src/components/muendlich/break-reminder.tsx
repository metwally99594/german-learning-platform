"use client";

export type BreakReminderProps = {
  open: boolean;
  onDismiss: () => void;
  onTakeBreak: () => void;
};

export function BreakReminder({ open, onDismiss, onTakeBreak }: BreakReminderProps) {
  if (!open) return null;

  return (
    <div className="rounded-lg border p-4">
      <p>Time for a break.</p>
      <button onClick={onTakeBreak}>Take a 2-min break</button>
      <button onClick={onDismiss}>Skip</button>
    </div>
  );
}
