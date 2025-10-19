import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import HomePage from '@/pages/HomePage'
import ParivarPage from '@/pages/ParivarPage'
import UtsukPage from '@/pages/UtsukPage'
import UtsukDetailPage from '@/pages/UtsukDetailPage'
import ToliPage from '@/pages/ToliPage'
// import AddToHomePrompt from '@/components/AddToHomePrompt'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, PrivateRoute } from '@/contexts/AuthContext'
import CreatePage from './pages/CreatePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create" element={<CreatePage/>} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/parivar" element={<PrivateRoute><ParivarPage /></PrivateRoute>} />
          <Route path="/utsuk" element={<PrivateRoute><UtsukPage /></PrivateRoute>} />
          <Route path="/utsuk-detail" element={<PrivateRoute><UtsukDetailPage /></PrivateRoute>} />
          <Route path="/toli" element={<PrivateRoute><ToliPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
         
        </Routes>
        {/* <AddToHomePrompt /> */}
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
