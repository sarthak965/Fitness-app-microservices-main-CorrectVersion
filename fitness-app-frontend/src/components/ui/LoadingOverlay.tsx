type LoadingOverlayProps = {
  active: boolean
  message?: string
}

export function LoadingOverlay({ active, message = 'Working on it...' }: LoadingOverlayProps) {
  if (!active) {
    return null
  }

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-overlay__card">
        <div className="loading-overlay__art" aria-hidden="true">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="64" r="36" fill="#1f2937" opacity="0.12" />
            <circle cx="60" cy="60" r="28" fill="#111827" opacity="0.9" />
            <circle cx="50" cy="52" r="4" fill="#f8fafc" />
            <circle cx="70" cy="52" r="4" fill="#f8fafc" />
            <circle cx="52" cy="54" r="2" fill="#0f172a" />
            <circle cx="72" cy="54" r="2" fill="#0f172a" />
            <path d="M54 66c4 3 8 3 12 0" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
            <rect x="30" y="74" width="60" height="28" rx="14" fill="#0ea5e9" opacity="0.2" />
            <rect x="38" y="80" width="44" height="20" rx="10" fill="#14b8a6" opacity="0.5" />
            <g className="loading-overlay__tablet">
              <rect x="40" y="26" width="40" height="26" rx="6" fill="#f8fafc" />
              <rect x="44" y="30" width="32" height="18" rx="4" fill="#e2e8f0" />
              <circle cx="60" cy="39" r="5" fill="#94a3b8" />
              <path d="M60 34v4l3 2" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
            </g>
          </svg>
        </div>
        <div className="loading-overlay__message">{message}</div>
      </div>
    </div>
  )
}
