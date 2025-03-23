import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://vileypothcjolanjaega.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbGV5cG90aGNqb2xhbmphZWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NDY4NDMsImV4cCI6MjA1ODMyMjg0M30.6kwJZJNd98hO0gxGImNbPaZqGYZd32ONUe1eEy3O-gE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});