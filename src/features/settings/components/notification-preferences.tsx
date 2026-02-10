import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { getNotifications, updateNotifications } from '../api'
import type { NotificationPreferences as NotificationPrefs } from '../types'

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPrefs | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getNotifications().then((data: NotificationPrefs) => {
      setPreferences(data)
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [])

  async function handleToggle(key: keyof Omit<NotificationPrefs, 'updated_at'>, value: boolean) {
    if (!preferences) return
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    try {
      await updateNotifications(updated)
    } catch {
      setPreferences(preferences)
    }
  }

  if (isLoading || !preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose what email notifications you receive.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email_notifications_enabled">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Enable or disable all email notifications.</p>
          </div>
          <Switch
            id="email_notifications_enabled"
            checked={preferences.email_notifications_enabled}
            onCheckedChange={(v) => handleToggle('email_notifications_enabled', v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="security_email_notifications_enabled">Security Alerts</Label>
            <p className="text-sm text-muted-foreground">Get notified about security events on your account.</p>
          </div>
          <Switch
            id="security_email_notifications_enabled"
            checked={preferences.security_email_notifications_enabled}
            onCheckedChange={(v) => handleToggle('security_email_notifications_enabled', v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing_emails_opt_in">Marketing Emails</Label>
            <p className="text-sm text-muted-foreground">Receive marketing and promotional emails.</p>
          </div>
          <Switch
            id="marketing_emails_opt_in"
            checked={preferences.marketing_emails_opt_in}
            onCheckedChange={(v) => handleToggle('marketing_emails_opt_in', v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="alert_trigger_notifications_enabled">Alert Trigger Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive emails when alerts are triggered.</p>
          </div>
          <Switch
            id="alert_trigger_notifications_enabled"
            checked={preferences.alert_trigger_notifications_enabled}
            onCheckedChange={(v) => handleToggle('alert_trigger_notifications_enabled', v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="alert_resolve_notifications_enabled">Alert Resolve Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive emails when alerts are resolved.</p>
          </div>
          <Switch
            id="alert_resolve_notifications_enabled"
            checked={preferences.alert_resolve_notifications_enabled}
            onCheckedChange={(v) => handleToggle('alert_resolve_notifications_enabled', v)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
