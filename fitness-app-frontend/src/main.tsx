import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from 'react-oauth2-code-pkce'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppAuthProvider } from './context/AppAuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { authConfig } from './services/authConfig'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider authConfig={authConfig}>
      <BrowserRouter>
        <ThemeProvider>
          <AppAuthProvider>
            <App />
          </AppAuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
