import { AuthShell } from '../components/auth-shell'
import { ResetPasswordForm } from '../components/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Create a new password."
      subtitle="Choose a strong password to keep your account secure."
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
