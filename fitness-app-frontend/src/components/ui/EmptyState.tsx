import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="section-shell text-center">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan/20 to-peach/30 text-3xl">
        *
      </div>
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
