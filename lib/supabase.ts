import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eocpwpvxcxtnjcydloeu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cliente Supabase seguro para uso no lado do cliente e do servidor
export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'placeholder-anon-key');

export default supabase;
