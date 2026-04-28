import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const IS_MOCK = !SUPABASE_URL.startsWith('https://') || SUPABASE_URL.includes('YOUR_PROJECT')

export async function createServerSupabase() {
  if (IS_MOCK) {
    // mock 모드: 아무것도 안 하는 더미 클라이언트 반환
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ data: null, error: null, eq: () => ({ data: null, error: null, single: () => ({ data: null, error: null }) }) }),
        insert: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
      }),
    } as any
  }

  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {}
      },
    },
  })
}
