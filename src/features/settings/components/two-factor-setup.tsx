import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Shield, ShieldCheck, ShieldOff, Copy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import {
  use2FAStatus,
  useSetup2FA,
  useVerify2FASetup,
  useDisable2FA,
  useRegenerateRecoveryCodes,
} from '../hooks'
import type { TwoFactorSetupResponse } from '../types'

const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(6, 'Code must be 6 digits')
    .max(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
})

type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>

const disablePasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required'),
})

type DisablePasswordFormValues = z.infer<typeof disablePasswordSchema>

const regeneratePasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required'),
})

type RegeneratePasswordFormValues = z.infer<typeof regeneratePasswordSchema>

function TwoFactorSetup() {
  const { data: status, isLoading } = use2FAStatus()
  const setup2FA = useSetup2FA()
  const verify2FA = useVerify2FASetup()
  const disable2FA = useDisable2FA()
  const regenerateCodes = useRegenerateRecoveryCodes()

  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [codesCopied, setCodesCopied] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])


  const verifyForm = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: '' },
  })

  const disableForm = useForm<DisablePasswordFormValues>({
    resolver: zodResolver(disablePasswordSchema),
    defaultValues: { password: '' },
  })

  const regenerateForm = useForm<RegeneratePasswordFormValues>({
    resolver: zodResolver(regeneratePasswordSchema),
    defaultValues: { password: '' },
  })

  function handleBeginSetup() {
    setup2FA.mutate(undefined, {
      onSuccess: (data) => {
        setSetupData(data)
      },
    })
  }

  function handleVerifySetup(values: VerifyCodeFormValues) {
    verify2FA.mutate(
      { code: values.code },
      {
        onSuccess: (data) => {
          setSetupData(null)
          verifyForm.reset()
          if (data.recovery_codes && data.recovery_codes.length > 0) {
            setRecoveryCodes(data.recovery_codes)
            setShowRecoveryCodes(true)
          }
        },
      }
    )
  }

  function handleDisable() {
    const password = disableForm.getValues('password')
    if (!password) return

    disable2FA.mutate(
      { password },
      {
        onSuccess: () => {
          setShowDisableDialog(false)
          disableForm.reset()
        },
      }
    )
  }

  function handleRegenerateCodes() {
    const password = regenerateForm.getValues('password')
    if (!password) return

    regenerateCodes.mutate(
      { password },
      {
        onSuccess: (data) => {
          setRecoveryCodes(data.recovery_codes)
          setShowRecoveryCodes(true)
          setShowRegenerateDialog(false)
          regenerateForm.reset()
        },
      }
    )
  }

  function handleShowRecoveryCodes() {
    setShowRecoveryCodes(true)
  }

  function handleCopyCodes() {
    if (recoveryCodes.length > 0) {
      navigator.clipboard.writeText(recoveryCodes.join('\n'))
      setCodesCopied(true)
      setTimeout(() => setCodesCopied(false), 2000)
    }
  }

  if (isLoading) {
    return <CardSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account.
            </CardDescription>
          </div>
          {status?.is_enabled ? (
            <Badge variant="success" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              Enabled
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <ShieldOff className="h-3 w-3" />
              Disabled
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 2FA Disabled - Setup Flow */}
        {!status?.is_enabled && !setupData && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication is not enabled. Enable it to add an extra
              layer of protection to your account using an authenticator app.
            </p>
            <Button onClick={handleBeginSetup} disabled={setup2FA.isPending}>
              {setup2FA.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enable 2FA
            </Button>
            {setup2FA.isError && (
              <p className="text-sm text-destructive">
                Failed to initialize 2FA setup. Please try again.
              </p>
            )}
          </div>
        )}

        {/* Setup in progress - QR Code + Verification */}
        {!status?.is_enabled && setupData && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">1. Scan this QR code with your authenticator app</h4>
              <div className="flex justify-center rounded-lg border bg-white p-4">
                <img
                  src={setupData.qr_code}
                  alt="2FA QR Code"
                  className="h-48 w-48"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">
                2. Or enter this secret manually
              </h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm">
                  {setupData.secret}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(setupData.secret)}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy secret</span>
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">
                3. Enter the 6-digit code from your authenticator app
              </h4>
              <form
                onSubmit={verifyForm.handleSubmit(handleVerifySetup)}
                className="flex items-start gap-2"
              >
                <div className="space-y-1">
                  <Input
                    placeholder="000000"
                    maxLength={6}
                    className="w-32 font-mono"
                    {...verifyForm.register('code')}
                  />
                  {verifyForm.formState.errors.code && (
                    <p className="text-xs text-destructive">
                      {verifyForm.formState.errors.code.message}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={verify2FA.isPending}>
                  {verify2FA.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verify & Enable
                </Button>
              </form>
              {verify2FA.isError && (
                <p className="text-sm text-destructive">
                  Invalid code. Please check your authenticator app and try again.
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={() => setSetupData(null)}
              className="text-muted-foreground"
            >
              Cancel Setup
            </Button>
          </div>
        )}

        {/* 2FA Enabled - Management */}
        {status?.is_enabled && (
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Recovery Codes</p>
                  <p className="text-sm text-muted-foreground">
                    {status.recovery_codes_remaining} codes remaining
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowRecoveryCodes}
                  >
                    View Codes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRegenerateDialog(true)}
                    disabled={regenerateCodes.isPending}
                  >
                    {regenerateCodes.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>

            {/* Regenerate Codes Dialog */}
            {showRegenerateDialog && (
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-medium">
                  Regenerate Recovery Codes
                </h4>
                <p className="text-sm text-muted-foreground">
                  Enter your password to regenerate recovery codes. Previous codes will be invalidated.
                </p>
                <form
                  onSubmit={regenerateForm.handleSubmit(() => handleRegenerateCodes())}
                  className="flex items-start gap-2"
                >
                  <div className="space-y-1">
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="w-64"
                      {...regenerateForm.register('password')}
                    />
                    {regenerateForm.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {regenerateForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={regenerateCodes.isPending}>
                    {regenerateCodes.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Confirm
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowRegenerateDialog(false)
                      regenerateForm.reset()
                    }}
                  >
                    Cancel
                  </Button>
                </form>
                {regenerateCodes.isError && (
                  <p className="text-sm text-destructive">
                    Failed to regenerate codes. Please check your password and try again.
                  </p>
                )}
              </div>
            )}

            {/* Recovery Codes Display */}
            {showRecoveryCodes && recoveryCodes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Recovery Codes</h4>
                  <Button variant="outline" size="sm" onClick={handleCopyCodes}>
                    <Copy className="h-4 w-4" />
                    {codesCopied ? 'Copied' : 'Copy All'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Store these codes in a safe place. Each code can only be used once.
                </p>
                <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted p-4">
                  {recoveryCodes.map((code: string) => (
                    <code key={code} className="font-mono text-sm">
                      {code}
                    </code>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRecoveryCodes(false)}
                  className="text-muted-foreground"
                >
                  Hide Codes
                </Button>
              </div>
            )}

            {regenerateCodes.isSuccess && !showRegenerateDialog && (
              <p className="text-sm text-success">
                Recovery codes regenerated. Previous codes are now invalid.
              </p>
            )}

            <Separator />

            <div className="space-y-2">
              <Button
                variant="destructive"
                onClick={() => setShowDisableDialog(true)}
              >
                <ShieldOff className="h-4 w-4" />
                Disable 2FA
              </Button>
            </div>

            {/* Disable 2FA Dialog */}
            {showDisableDialog && (
              <div className="rounded-lg border border-destructive p-4 space-y-3">
                <h4 className="text-sm font-medium text-destructive">
                  Confirm Disable 2FA
                </h4>
                <p className="text-sm text-muted-foreground">
                  Enter your password to disable two-factor authentication.
                </p>
                <form
                  onSubmit={disableForm.handleSubmit(() => handleDisable())}
                  className="flex items-start gap-2"
                >
                  <div className="space-y-1">
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="w-64"
                      {...disableForm.register('password')}
                    />
                    {disableForm.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {disableForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={disable2FA.isPending}
                  >
                    {disable2FA.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Confirm Disable
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowDisableDialog(false)
                      disableForm.reset()
                    }}
                  >
                    Cancel
                  </Button>
                </form>
                {disable2FA.isError && (
                  <p className="text-sm text-destructive">
                    Invalid password. Please try again.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { TwoFactorSetup }
