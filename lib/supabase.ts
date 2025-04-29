import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'http://supabasekong-xsow0c0oock8wooo8cg40o0c.82.29.190.97.sslip.io';
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NTkyMjQ4MCwiZXhwIjo0OTAxNTk2MDgwLCJyb2xlIjoiYW5vbiJ9.WQf_CkFfHMkx-fHXKg1YdvNOS1uUZfMJI3xNbZVZkL4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});