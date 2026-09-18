import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    (window as any).__RUNTIME_CONFIG__?.VITE_SUPABASE_URL || 
                    'https://yxvfqvjjsyyipdmxawkv.supabase.co';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                       (window as any).__RUNTIME_CONFIG__?.VITE_SUPABASE_ANON_KEY || 
                       'sb_publishable_1b7v5-zYPerT1jfgKwUR3Q_zT19y7B9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;