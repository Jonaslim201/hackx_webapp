import type { CaseStatus } from '@/types/case';

const STATUS_STYLES: Record<CaseStatus, string> = {
  open: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200',
  'in-progress': 'border-amber-400/40 bg-amber-400/15 text-amber-100',
  closed: 'border-sky-400/40 bg-sky-400/15 text-sky-100',
  archived: 'border-zinc-500/40 bg-zinc-500/15 text-zinc-200'
};

export default function StatusBadge({ status }: { status: CaseStatus }) {
  const label = status.replace(/-/g, ' ');
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${STATUS_STYLES[status]}`}
    >
      {label}
    </span>
  );
}
