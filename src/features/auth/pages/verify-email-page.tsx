import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import * as authApi from '../api'
import { AuthShell } from '../components/auth-shell'
import { Button } from '@/components/ui/button'
import { isAxiosError } from 'axios'

export default function VerifyEmailPage() {
  const { token: paramToken = '' } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()
  const queryToken = searchParams.get('token') ?? ''
  const token = paramToken || queryToken
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Invalid verification link.')
      return
    }

    let cancelled = false

    async function verify() {
      try {
        await authApi.verifyEmail({ token })
        if (!cancelled) {
          setStatus('success')
        }
      } catch (error: unknown) {
        if (cancelled) return
        if (isAxiosError(error)) {
          const message =
            error.response?.data?.detail ??
            error.response?.data?.message ??
            'Email verification failed. The link may have expired.'
          setErrorMessage(message)
        } else {
          setErrorMessage('An unexpected error occurred. Please try again.')
        }
        setStatus('error')
      }
    }

    verify()

    return () => {
      cancelled = true
    }
  }, [token])

  const subtitle =
    status === 'loading'
      ? 'Checking your verification link — this will only take a moment.'
      : status === 'success'
      ? 'Your email address has been verified successfully.'
      : 'Something went wrong with your verification link.'

  return (
    <AuthShell title="Verify your email." subtitle={subtitle}>
      {status === 'loading' && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-5">
          <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            Your account is ready. Sign in to start monitoring your APIs.
          </div>
          <Button asChild className="w-full">
            <Link to="/login">Sign in to your account</Link>
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-5">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      )}
    </AuthShell>
  )
}
