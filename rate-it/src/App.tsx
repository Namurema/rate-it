import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HomePage from './pages/HomePage'
import ProviderDetailPage from './pages/ProviderDetailPage'
import AddProviderPage from './pages/AddProviderPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import ReviewModerationPage from './pages/admin/ReviewModerationPage'
import ProviderModerationPage from './pages/admin/ProviderModerationPage'
import ManageProvidersPage from './pages/admin/ManageProvidersPage'
import ProtectedRoute from './components/ProtectedRoute'

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-sm">Page not found</p>
        <a href="/" className="text-orange-500 text-sm mt-4 inline-block hover:underline">
          Go home
        </a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/provider/:id" element={<ProviderDetailPage />} />
          <Route path="/add-provider" element={<AddProviderPage />} />

          {/* Admin auth */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute><AdminDashboardPage /></ProtectedRoute>
          } />
          <Route path="/admin/reviews" element={
            <ProtectedRoute><ReviewModerationPage /></ProtectedRoute>
          } />
          <Route path="/admin/providers" element={
            <ProtectedRoute><ProviderModerationPage /></ProtectedRoute>
          } />
          <Route path="/admin/manage" element={
            <ProtectedRoute><ManageProvidersPage /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}