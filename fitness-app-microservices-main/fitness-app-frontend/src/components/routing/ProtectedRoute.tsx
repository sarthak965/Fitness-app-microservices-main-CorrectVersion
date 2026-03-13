import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppAuth } from '../../context/AppAuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAppAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
