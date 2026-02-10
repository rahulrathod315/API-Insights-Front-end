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

const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    password_confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirm: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setApiError(null)
    setSuccessMessage(null)
    try {
      await authApi.register(values)
      setSuccessMessage(
        'Registration successful! Please check your email to verify your account.'
      )
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
          setApiError(messages.join(' ') || 'Registration failed. Please try again.')
        } else {
          setApiError('Registration failed. Please try again.')
        }
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            placeholder="John"
            autoComplete="given-name"
            {...register('first_name')}
          />
          {errors.first_name && (
            <p className="text-sm text-destructive">{errors.first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            placeholder="Doe"
            autoComplete="family-name"
            {...register('last_name')}
          />
          {errors.last_name && (
            <p className="text-sm text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password_confirm">Confirm Password</Label>
        <Input
          id="password_confirm"
          type="password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          {...register('password_confirm')}
        />
        {errors.password_confirm && (
          <p className="text-sm text-destructive">{errors.password_confirm.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
