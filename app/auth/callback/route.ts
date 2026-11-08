import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const requestedNext = searchParams.get('next') ?? '/'
  const candidate = new URL(requestedNext, origin)
  const destination = candidate.origin === origin ? candidate : new URL('/', origin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(destination)
  }

  return NextResponse.redirect(new URL('/suppliers?auth=callback_error', origin))
}
