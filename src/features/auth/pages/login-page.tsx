import { useLocation } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { LoginForm } from '../components/login-form'

export default function LoginPage() {
  const location = useLocation()
  const successMessage = (location.state as { message?: string } | null)?.message

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            API Insights
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor and analyze your APIs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <div
                className={cn(
                  'mb-4 rounded-md border border-primary/50 bg-primary/10 p-3 text-sm text-primary'
                )}
              >
                {successMessage}
              </div>
            )}
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
