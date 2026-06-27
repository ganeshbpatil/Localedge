export type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'orange' | 'purple' | 'gray';

const styles: Record<BadgeVariant, React.CSSProperties> = {
  green:  { background: '#052e16', color: '#4ade80', border: '1px solid #166534' },
  red:    { background: '#2d0a0a', color: '#f87171', border: '1px solid #7f1d1d' },
  yellow: { background: '#1c1407', color: '#facc15', border: '1px solid #713f12' },
  blue:   { background: '#0c1a2e', color: '#60a5fa', border: '1px solid #1e3a5f' },
  orange: { background: '#1a0d00', color: '#fb923c', border: '1px solid #7c2d12' },
  purple: { background: '#1a0d2e', color: '#c084fc', border: '1px solid #4c1d95' },
  gray:   { background: '#111827', color: '#9ca3af', border: '1px solid #374151' },
};

export function Badge({ children, variant = 'gray' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return (
    <span style={{ ...styles[variant], fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', display: 'inline-block' }}>
      {children}
    </span>
  );
}
