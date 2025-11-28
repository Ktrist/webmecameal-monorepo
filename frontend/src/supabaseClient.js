import { createClient } from '@supabase/supabase-js'

// REMPLACEZ CECI PAR VOS PROPRES CLÉS
const supabaseUrl = 'https://kxahqxygbxlhasgivkgi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4YWhxeHlnYnhsaGFzZ2l2a2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDQyNjAsImV4cCI6MjA3ODY4MDI2MH0.VZm6RU7oWtIPFkaU4ZgjsccIRwsoEj3A_IlimFpx654'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)