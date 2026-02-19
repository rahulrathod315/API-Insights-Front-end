import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

function PageErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="flex max-w-md flex-col items-center p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go back
          </Button>
          <Button onClick={() => window.location.assign('/projects')}>
            Go to projects
          </Button>
        </div>
      </Card>
    </div>
  )
}

export { PageErrorFallback }
