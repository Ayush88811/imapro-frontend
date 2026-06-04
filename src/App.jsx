import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useConfigs } from './hooks/useConfigs'
import { usePolling } from './hooks/usePolling'
import Navbar from './components/shared/Navbar'
import JobDashboard from './components/shared/JobDashboard'
import ComposePage from './pages/ComposePage'
import ConfigsPage from './pages/ConfigsPage'
import ReportsPage from './pages/ReportsPage'
import LoginPage from './pages/LoginPage'

function Dashboard() {
  const [activeTab, setActiveTab] = useState('compose')
  const { configs, selectedConfigId, setSelectedConfigId, loading, saveConfig, updateConfig, deleteConfig, setDefault, testConfig } = useConfigs()
  const { dashboardData, triggerCheck } = usePolling()

  const handleSaveConfig = async (data, id) => {
    if (id) return await updateConfig(id, data)
    return await saveConfig(data)
  }

  const handleSent = () => {
    triggerCheck()
    setTimeout(() => setActiveTab('report'), 1500)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <JobDashboard data={dashboardData} />

      {activeTab === 'compose' && (
        <ComposePage
          configs={configs}
          selectedConfigId={selectedConfigId}
          onSelectConfig={setSelectedConfigId}
          onSaveConfig={handleSaveConfig}
          onTestConfig={testConfig}
          onDeleteConfig={deleteConfig}
          onSetDefault={setDefault}
          onSent={handleSent}
        />
      )}
      {activeTab === 'report' && <ReportsPage />}
      {activeTab === 'configs' && (
        <ConfigsPage
          configs={configs}
          onSave={handleSaveConfig}
          onTest={testConfig}
          onDelete={deleteConfig}
          onSetDefault={setDefault}
        />
      )}
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
