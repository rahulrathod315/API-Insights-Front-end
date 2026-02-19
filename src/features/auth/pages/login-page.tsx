import { useLocation } from 'react-router-dom'
import { AuthShell } from '../components/auth-shell'
import { LoginForm } from '../components/login-form'
import { cn } from '@/lib/utils/cn'

export default function LoginPage() {
  const location = useLocation()
  const successMessage = (location.state as { message?: string } | null)?.message

  return (
    <AuthShell>
      <div className="w-full space-y-5">
        {successMessage && (
          <div
            className={cn(
              'rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success'
            )}
          >
            {successMessage}
          </div>
        )}
        <LoginForm />
      </div>
    </AuthShell>
  )
}
