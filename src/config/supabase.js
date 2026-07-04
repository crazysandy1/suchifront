// Supabase has been removed. This file is a no-op stub kept for any
// legacy imports that haven't been updated yet. Do not add new code here.
export const supabase = {
  auth: {
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase removed — use /api/auth/login') }),
    signUp: () => Promise.resolve({ data: null, error: new Error('Supabase removed — use /api/auth/signup') }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    resetPasswordForEmail: () => Promise.resolve({ error: new Error('Password reset not supported in this version') }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
  }),
};

export default supabase;
