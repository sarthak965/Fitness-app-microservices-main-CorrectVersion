type ActionNoticeTone = 'info' | 'success' | 'warning'

const toneStyles: Record<ActionNoticeTone, string> = {
  info: 'border-sky-200 bg-sky-50/90 text-sky-900',
  success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50/90 text-amber-900',
}

export function ActionNotice({
  title,
  message,
  tone = 'info',
  loading = false,
}: {
  title: string
  message: string
  tone?: ActionNoticeTone
  loading?: boolean
}) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${toneStyles[tone]}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{title}</div>
          <div className="mt-2 font-medium">{message}</div>
        </div>
        {loading ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
