import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import './i18n'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Layout>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              border: '1px solid #E8E4DC',
            },
            success: {
              iconTheme: { primary: '#E44D26', secondary: 'white' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
