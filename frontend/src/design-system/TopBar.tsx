import { ReactNode } from 'react';

export function TopBar({ title, meta, actions }: { title: string; meta?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-paper px-8 py-4">
      <div>
        <h1 className="text-[19px] font-semibold">{title}</h1>
        {meta && <div className="mt-[3px] text-xs text-slate">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}
