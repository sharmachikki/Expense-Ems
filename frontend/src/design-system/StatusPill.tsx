type PillColor = 'green' | 'amber' | 'red' | 'slate' | 'purple' | 'teal';

const COLOR_CLASSES: Record<PillColor, string> = {
  green: 'bg-green-bg text-green',
  amber: 'bg-amber-bg text-amber',
  red: 'bg-red-bg text-red',
  slate: 'bg-paper-dim text-slate',
  purple: 'bg-purple-bg text-purple',
  teal: 'bg-teal-bg text-teal',
};

export function StatusPill({ color, children }: { color: PillColor; children: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11px] font-semibold tracking-wide ${COLOR_CLASSES[color]}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  );
}
