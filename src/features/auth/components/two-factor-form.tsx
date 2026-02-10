import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api'
import { tokenManager } from '@/lib/auth/token-manager'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import { isAxiosError } from 'axios'

const twoFactorSchema = z.object({
  code: z
    .string()
    .min(1, 'Verification code is required')
    .regex(/^\d{6}$|^\w{8,}$/, 'Enter a 6-digit code or a recovery code'),
})

type TwoFactorFormValues = z.infer<typeof twoFactorSchema>

export function TwoFactorForm() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  })

  async function onSubmit(values: TwoFactorFormValues) {
    setApiError(null)

    const challengeToken = tokenManager.getChallengeToken()
    if (!challengeToken) {
      setApiError('Challenge token not found. Please log in again.')
      return
    }

    try {
      const result = await authApi.twoFactorChallenge({
        code: values.code,
        challenge_token: challengeToken,
      })

      tokenManager.setTokens(result.tokens.access, result.tokens.refresh)
      tokenManager.clearChallengeToken()
      await refreshUser()
      navigate('/projects')
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.detail ??
          error.response?.data?.message ??
          'Invalid verification code. Please try again.'
        setApiError(message)
      } else {
        setApiError('An unexpected error occurred. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {isRecoveryMode
          ? 'Enter one of your recovery codes to verify your identity.'
          : 'Enter the 6-digit code from your authenticator app to continue.'}
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
        <Label htmlFor="code">
          {isRecoveryMode ? 'Recovery Code' : 'Verification Code'}
        </Label>
        <Input
          id="code"
          type="text"
          inputMode={isRecoveryMode ? 'text' : 'numeric'}
          placeholder={isRecoveryMode ? 'Enter recovery code' : '000000'}
          autoComplete="one-time-code"
          autoFocus
          {...register('code')}
        />
        {errors.code && (
          <p className="text-sm text-destructive">{errors.code.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Verifying...' : 'Verify'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsRecoveryMode(!isRecoveryMode)}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          {isRecoveryMode ? 'Use authenticator code instead' : 'Use a recovery code instead'}
        </button>
      </div>
    </form>
  )
}
