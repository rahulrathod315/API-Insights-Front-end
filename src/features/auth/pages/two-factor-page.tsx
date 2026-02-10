import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TwoFactorForm } from '../components/two-factor-form'

export default function TwoFactorPage() {
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
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Verify your identity to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TwoFactorForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
