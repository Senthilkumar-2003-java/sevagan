import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login          from './pages/Login'
import DashboardLayout from './pages/DashboardLayout'
import CreateDonor    from './pages/CreateDonor'
import DonorsList     from './pages/DonorsList'
import Receipt        from './pages/Receipt'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index        element={<Navigate to="/donors/create" replace />} />
            <Route path="donors/create" element={<CreateDonor />} />
            <Route path="donors/list"   element={<DonorsList />} />
            <Route path="receipt"       element={<Receipt />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}