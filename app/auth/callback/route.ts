import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const requestedNext = searchParams.get('next') ?? '/auth/login'
  const nextPath = requestedNext.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/auth/login'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(nextPath, origin))
  }

  return NextResponse.redirect(new URL('/auth/error', origin))
}
