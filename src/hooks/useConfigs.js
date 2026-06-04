import { useState, useEffect, useCallback } from 'react'
import { api, processPassword, validateGmailPassword } from '../utils/api'
import toast from 'react-hot-toast'

export function useConfigs() {
  const [configs, setConfigs] = useState([])
  const [selectedConfigId, setSelectedConfigId] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await api.getConfigs()
      if (res.success) {
        const cfgs = res.userConfigs || []
        setConfigs(cfgs)
        const def = cfgs.find(c => c.isDefault)
        if (def && !selectedConfigId) setSelectedConfigId(def.id)
      }
    } catch (e) {
      toast.error('Failed to load configurations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const saveConfig = async (data) => {
    const { pass: rawPass, host } = data
    if (rawPass) {
      const v = validateGmailPassword(rawPass, host)
      if (!v.valid) { toast.error(v.message); return false }
      data = { ...data, pass: processPassword(rawPass, host) }
    }
    const res = await api.createConfig(data)
    if (res.success) {
      toast.success('Configuration saved!')
      await load()
      if (data.isDefault && res.configId) setSelectedConfigId(res.configId)
      return true
    }
    toast.error(res.message || 'Failed to save')
    return false
  }

  const updateConfig = async (id, data) => {
    const { pass: rawPass, host } = data
    if (rawPass?.trim()) {
      const v = validateGmailPassword(rawPass, host)
      if (!v.valid) { toast.error(v.message); return false }
      data = { ...data, pass: processPassword(rawPass, host) }
    } else {
      const { pass, ...rest } = data
      data = rest
    }
    const res = await api.updateConfig(id, data)
    if (res.success) { toast.success('Configuration updated!'); await load(); return true }
    toast.error(res.message || 'Failed to update')
    return false
  }

  const deleteConfig = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    const res = await api.deleteConfig(id)
    if (res.success) {
      toast.success('Configuration deleted')
      if (selectedConfigId === id) setSelectedConfigId(null)
      await load()
    } else {
      toast.error(res.message || 'Failed to delete')
    }
  }

  const setDefault = async (id) => {
    const res = await api.setDefaultConfig(id)
    if (res.success) { toast.success('Default updated'); await load() }
    else toast.error('Failed to update default')
  }

  const testConfig = async (data) => {
    const { pass: rawPass, host } = data
    if (!rawPass?.trim()) { toast.error('Please enter the password to test'); return false }
    const v = validateGmailPassword(rawPass, host)
    if (!v.valid) { toast.error(v.message); return false }
    const processed = { ...data, pass: processPassword(rawPass, host) }
    const toastId = toast.loading('Testing SMTP connection...')
    const res = await api.testConfig(processed)
    toast.dismiss(toastId)
    if (res.success) { toast.success('Connection test successful!'); return true }
    toast.error(res.message || 'Connection test failed')
    return false
  }

  return { configs, selectedConfigId, setSelectedConfigId, loading, saveConfig, updateConfig, deleteConfig, setDefault, testConfig, reload: load }
}
