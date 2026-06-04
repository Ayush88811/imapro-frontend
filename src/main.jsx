import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#172033',
            color: '#e2e8f0',
            border: '1px solid rgba(71,85,105,0.5)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#172033' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#172033' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
