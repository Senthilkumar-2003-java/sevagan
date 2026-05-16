import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing         from './pages/Landing'       // ✅ இதை add பண்ணு
import Login           from './pages/Login'
import DashboardLayout from './pages/DashboardLayout'
import CreateDonor     from './pages/CreateDonor'
import DonorsList      from './pages/DonorsList'
import Receipt         from './pages/Receipt'
import ConfirmDoners from './pages/confirm_doners'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ✅ Landing — public home page */}
          <Route path="/" element={<Landing />} />

          {/* ✅ Login page */}
          <Route path="/login" element={<Login />} />

          {/* ✅ Dashboard — login வேணும் */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard/donors/create" replace />} />
            <Route path="donors/create" element={<CreateDonor />} />
            <Route path="donors/list"   element={<DonorsList />} />
            <Route path="receipt"       element={<Receipt />} />
            <Route path="/dashboard/donors/confirm" element={<ConfirmDoners />} />
          </Route>

          {/* ✅ Unknown route → Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}