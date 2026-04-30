import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavBar } from './components/ui/NavBar'
import { Toast } from './components/ui/Toast'
import { useAuth } from './lib/auth'
import { Home } from './pages/Home'
import { Channel } from './pages/Channel'
import { My } from './pages/My'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

function AppInner() {
  const { restore } = useAuth()
  useEffect(() => { restore() }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <div style={{ flex: 1, paddingBottom: 60 }}>
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/channel/:handle" element={<Channel />} />
          <Route path="/my"              element={<My />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
        </Routes>
      </div>
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
