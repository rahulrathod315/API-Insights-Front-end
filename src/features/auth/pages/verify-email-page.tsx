import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import * as authApi from '../api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            API Insights
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor and analyze your APIs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>
              {status === 'loading' && 'Verifying your email address...'}
              {status === 'success' && 'Your email has been verified'}
              {status === 'error' && 'Verification failed'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'loading' && (
              <div className="flex items-center justify-center py-8">
                <div
                  className={cn(
                    'h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary'
                  )}
                />
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div
                  className={cn(
                    'rounded-md border border-primary/50 bg-primary/10 p-4 text-sm text-primary'
                  )}
                >
                  Your email address has been verified successfully. You can now sign in to your account.
                </div>
                <Button asChild className="w-full">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div
                  className={cn(
                    'rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive'
                  )}
                >
                  {errorMessage}
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Back to sign in</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
