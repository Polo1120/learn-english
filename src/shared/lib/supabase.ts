import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables!');
    console.log('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

if (import.meta.env.DEV) {
    console.log('Supabase initialized at:', supabaseUrl);
}

export default supabase;
