import { redirect } from 'next/navigation'

type LoginAliasProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginAliasPage({ searchParams }: LoginAliasProps) {
  const params = await searchParams
  const requestedNext = params.next
  const next = Array.isArray(requestedNext) ? requestedNext[0] : requestedNext
  const query = next ? `?next=${encodeURIComponent(next)}` : ''

  redirect(`/auth/login${query}`)
}
