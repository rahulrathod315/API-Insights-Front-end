import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useParams, useNavigate } from 'react-router-dom'
import * as authApi from '../api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import { isAxiosError } from 'axios'

const resetPasswordSchema = z.object({
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const { token = '' } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: '',
    },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setApiError(null)
    try {
      await authApi.resetPassword({
        token,
        new_password: values.new_password,
      })
      navigate('/login', {
        state: { message: 'Password reset successful. Please sign in with your new password.' },
      })
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const data = error.response?.data
        if (typeof data === 'object' && data !== null) {
          const messages: string[] = []
          for (const value of Object.values(data)) {
            if (Array.isArray(value)) {
              messages.push(...value.map(String))
            } else if (typeof value === 'string') {
              messages.push(value)
            }
          }
          setApiError(messages.join(' ') || 'Password reset failed. Please try again.')
        } else {
          setApiError('Password reset failed. Please try again.')
        }
      } else {
        setApiError('An unexpected error occurred. Please try again.')
      }
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <div
          className={cn(
            'rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive'
          )}
        >
          Invalid password reset link. Please request a new one.
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/forgot-password"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Request a new reset link
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Label htmlFor="new_password">New Password</Label>
        <Input
          id="new_password"
          type="password"
          placeholder="Enter new password"
          autoComplete="new-password"
          {...register('new_password')}
        />
        {errors.new_password && (
          <p className="text-sm text-destructive">{errors.new_password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Resetting password...' : 'Reset Password'}
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
