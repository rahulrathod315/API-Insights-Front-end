import { AuthShell } from '../components/auth-shell'
import { TwoFactorForm } from '../components/two-factor-form'

export default function TwoFactorPage() {
  return (
    <AuthShell
      title="Two-factor authentication."
      subtitle="Enter the 6-digit code from your authenticator app to verify your identity."
    >
      <TwoFactorForm />
    </AuthShell>
  )
}
