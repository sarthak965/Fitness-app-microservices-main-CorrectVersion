import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string
  value: string
  detail: string
  accent: ReactNode
}) {
  return (
    <div className="section-shell relative overflow-hidden">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-gradient-to-br from-white/50 to-transparent blur-2xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
          <div className="mt-4 font-display text-4xl font-bold text-ink">{value}</div>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <div className="theme-surface-dark rounded-2xl p-3">{accent}</div>
      </div>
    </div>
  )
}
