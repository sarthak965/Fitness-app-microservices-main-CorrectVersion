import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { HistoryPage } from './pages/HistoryPage'
import { LandingPage } from './pages/LandingPage'
import { CoachChatPage } from './pages/CoachChatPage'
import { NutritionPlanDetailPage } from './pages/NutritionPlanDetailPage'
import { PlanDetailPage } from './pages/PlanDetailPage'
import { PlansPage } from './pages/PlansPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { TrackActivityPage } from './pages/TrackActivityPage'

function App() {
  return (
    <>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="track" element={<TrackActivityPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="plans/:planId" element={<PlanDetailPage />} />
          <Route path="plans/nutrition/:planId" element={<NutritionPlanDetailPage />} />
          <Route path="coach-chat" element={<CoachChatPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
