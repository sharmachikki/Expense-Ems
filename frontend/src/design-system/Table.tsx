import { ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return (
    <table className="w-full border-collapse text-[13px]">
      <tbody className="[&_tr:not(:last-child)_td]:border-b [&_tr:not(:last-child)_td]:border-line [&_tr:hover]:bg-[#FBFAF7]">
        {children}
      </tbody>
    </table>
  );
}

export function TableHead({ columns, alignRight = [] }: { columns: string[]; alignRight?: number[] }) {
  return (
    <thead>
      <tr>
        {columns.map((col, i) => (
          <th
            key={col}
            className={`whitespace-nowrap border-b border-line bg-paper-dim px-5 py-2.5 text-left text-[10.5px] uppercase tracking-wider text-slate ${
              alignRight.includes(i) ? 'text-right font-mono' : ''
            }`}
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function Td({ children, amt = false }: { children: ReactNode; amt?: boolean }) {
  return (
    <td className={`px-5 py-3 align-middle text-ink-soft ${amt ? 'text-right font-mono' : ''}`}>{children}</td>
  );
}
