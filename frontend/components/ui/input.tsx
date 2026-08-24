import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef, ReactNode } from 'react';

type FieldWrapperProps = { label?: string; error?: string; hint?: string; children: ReactNode };

export function FieldWrapper({ label, error, hint, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink">{label}</label>}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const baseFieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate-400 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string };
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className = '', ...props }, ref) => (
  <FieldWrapper label={label} error={error} hint={hint}>
    <input ref={ref} className={`${baseFieldClass} ${error ? 'border-red-300' : ''} ${className}`} {...props} />
  </FieldWrapper>
));
Input.displayName = 'Input';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string; hint?: string };
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, hint, className = '', ...props }, ref) => (
  <FieldWrapper label={label} error={error} hint={hint}>
    <textarea ref={ref} className={`${baseFieldClass} min-h-[100px] resize-y ${className}`} {...props} />
  </FieldWrapper>
));
Textarea.displayName = 'Textarea';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; hint?: string };
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, hint, className = '', children, ...props }, ref) => (
  <FieldWrapper label={label} error={error} hint={hint}>
    <select ref={ref} className={`${baseFieldClass} ${className}`} {...props}>
      {children}
    </select>
  </FieldWrapper>
));
Select.displayName = 'Select';
