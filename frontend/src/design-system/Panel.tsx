import { ReactNode } from 'react';

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mb-6 overflow-hidden rounded border border-line bg-white ${className}`}>{children}</div>;
}

export function PanelHead({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {actions}
    </div>
  );
}

export function PanelBody({ children, padded = false }: { children: ReactNode; padded?: boolean }) {
  return <div className={padded ? 'px-5 py-[18px]' : 'py-1'}>{children}</div>;
}
