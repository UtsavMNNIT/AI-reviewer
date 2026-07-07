import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Route components are code-split so heavy deps (Monaco editor, Recharts, webcam)
// load only when their page is visited, keeping the initial bundle small.
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const InterviewsPage = lazy(() => import('./pages/InterviewsPage'))
const InterviewSessionPage = lazy(() => import('./pages/InterviewSessionPage'))
const CodingRoundPage = lazy(() => import('./pages/CodingRoundPage'))
const ResumeUploadPage = lazy(() => import('./pages/ResumeUploadPage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/resumes" element={<ResumeUploadPage />} />
                <Route path="/interviews" element={<InterviewsPage />} />
                <Route path="/interviews/:id" element={<InterviewSessionPage />} />
                <Route path="/coding" element={<CodingRoundPage />} />
                <Route path="/results" element={<ResultsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
