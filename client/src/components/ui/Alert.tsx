type Tone = 'success' | 'error' | 'info';

interface AlertProps {
  tone: Tone;
  children: string;
  className?: string;
}

const TONES: Record<Tone, string> = {
  success: 'border-brand-mint/40 bg-brand-mint/10 text-brand-mint',
  error: 'border-red-400/40 bg-red-500/10 text-red-200',
  info: 'border-brand-cyan/40 bg-brand-cyan/10 text-brand-100',
};

export const Alert = ({ tone, children, className = '' }: AlertProps) => (
  <p
    role={tone === 'error' ? 'alert' : 'status'}
    className={`rounded-lg border px-4 py-3 text-sm ${TONES[tone]} ${className}`}
  >
    {children}
  </p>
);
