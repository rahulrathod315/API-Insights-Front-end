import { AuthShell } from '../components/auth-shell'
import { RegisterForm } from '../components/register-form'

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account."
      subtitle="Start monitoring your APIs in minutes. No credit card required."
    >
      <RegisterForm />
    </AuthShell>
  )
}
