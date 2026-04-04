import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

if (typeof window !== 'undefined') {
  // Suppress the annoying "Invalid Refresh Token" error from polling the terminal
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Invalid Refresh Token')) {
      return;
    }
    originalError(...args);
  };

  // Ensure stale tokens are swept from local storage if they exist
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
    }
  });
}