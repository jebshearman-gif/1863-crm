import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Storage helpers (drop-in replacements for window.storage) ────────────────

export const sGet = async (key) => {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    if (error || !data) return null
    return data.value
  } catch {
    return null
  }
}

export const sSet = async (key, val) => {
  try {
    const { error } = await supabase
      .from('app_data')
      .upsert({ key, value: val, updated_at: new Date().toISOString() })
    if (error) console.error('sSet error:', error)
  } catch (e) {
    console.error('sSet exception:', e)
  }
}

// ── Auth helpers ─────────────────────────────────────────────────────────────

export const getProfile = async (userId) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export const getAllProfiles = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at')
  return data || []
}

export const updateUserRole = async (userId, role) => {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  return !error
}
