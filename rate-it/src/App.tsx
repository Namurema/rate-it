import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProviderDetailPage from './pages/ProviderDetailPage'
import AddProviderPage from './pages/AddProviderPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/provider/:id" element={<ProviderDetailPage />} />
        <Route path="/add-provider" element={<AddProviderPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}