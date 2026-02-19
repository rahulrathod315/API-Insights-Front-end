import { AuthShell } from '../components/auth-shell'
import { ForgotPasswordForm } from '../components/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password."
      subtitle="Enter your email address and we'll send you a secure link to reset your credentials."
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
