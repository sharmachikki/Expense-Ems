import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'default' | 'ghost' | 'gold' | 'danger' | 'purple';
type Size = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// Mirrors .btn / .btn.ghost / .btn.gold / .btn.danger / .btn.purple / .btn.sm
// from the demo's stylesheet §10.
const VARIANT_CLASSES: Record<Variant, string> = {
  default: 'bg-ink border-ink text-white hover:bg-ink-soft',
  ghost: 'bg-transparent border-line text-ink hover:bg-paper-dim',
  gold: 'bg-gold border-gold text-white hover:bg-[#9c7209] hover:border-[#9c7209]',
  danger: 'bg-transparent border-red text-red hover:bg-red-bg',
  purple: 'bg-purple border-purple text-white hover:bg-[#473a6e]',
};

const SIZE_CLASSES: Record<Size, string> = {
  md: 'px-4 py-[9px] text-[13px]',
  sm: 'px-[11px] py-[5px] text-xs',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center gap-1.5 rounded border font-medium leading-none whitespace-nowrap transition-colors disabled:opacity-40 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
