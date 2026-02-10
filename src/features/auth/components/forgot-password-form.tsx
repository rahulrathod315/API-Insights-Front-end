import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import * as authApi from '../api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import { isAxiosError } from 'axios'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setApiError(null)
    setSuccessMessage(null)
    try {
      await authApi.forgotPassword(values)
      setSuccessMessage(
        'If an account exists with that email address, you will receive a password reset link shortly.'
      )
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.detail ??
          error.response?.data?.message ??
          'Something went wrong. Please try again.'
        setApiError(message)
      } else {
        setApiError('An unexpected error occurred. Please try again.')
      }
    }
  }

  if (successMessage) {
    return (
      <div className="space-y-4">
        <div
          className={cn(
            'rounded-md border border-primary/50 bg-primary/10 p-4 text-sm text-primary'
          )}
        >
          {successMessage}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      {apiError && (
        <div
          className={cn(
            'rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive'
          )}
          role="alert"
        >
          {apiError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          to="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  )
}
