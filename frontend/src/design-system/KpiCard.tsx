export function KpiCard({
  label,
  value,
  delta,
  deltaTone = 'default',
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'default' | 'up' | 'warn';
}) {
  const deltaClass = deltaTone === 'up' ? 'text-green' : deltaTone === 'warn' ? 'text-amber' : 'text-slate';
  return (
    <div className="min-w-[160px] flex-1 basis-[calc(25%-12px)] rounded border border-line bg-white px-[18px] pb-4 pt-[18px]">
      <div className="mb-2.5 text-[10.5px] uppercase tracking-wider text-slate">{label}</div>
      <div className="font-mono text-2xl font-semibold leading-none text-ink">{value}</div>
      {delta && <div className={`mt-2 text-[11.5px] ${deltaClass}`}>{delta}</div>}
    </div>
  );
}

export function KpiRow({ children }: { children: React.ReactNode }) {
  return <div className="mb-7 flex flex-wrap gap-4">{children}</div>;
}
