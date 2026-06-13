// supabase-client.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://tqltylavwrsemhgdnorr.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxbHR5bGF2d3JzZW1oZ2Rub3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTIxNDksImV4cCI6MjA5Njc2ODE0OX0.QyCfEf7Pif3-ZfhhwJ8PWUemi37orIZpiX2ZzpCRAyg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to get current user quickly
export async function currentUser() {
  return supabase.auth.getUser().then(r=>r.data.user);
}
