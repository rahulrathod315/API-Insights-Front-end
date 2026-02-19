import type React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/page-header'
import { ProfileForm } from '../components/profile-form'
import { ChangePasswordForm } from '../components/change-password-form'
import { TwoFactorSetup } from '../components/two-factor-setup'
import { SessionsList } from '../components/sessions-list'
import { SecurityEvents } from '../components/security-events'
import { NotificationPreferences } from '../components/notification-preferences'
import { DangerZone } from '../components/danger-zone'
import { useSearchParams } from 'react-router-dom'
import { User, Shield, Bell, AlertTriangle } from 'lucide-react'

interface NavItem {
  value: string
  label: string
  icon: React.ElementType
  description: string
  destructive?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    value: 'profile',
    label: 'Profile',
    icon: User,
    description: 'Personal information & timezone',
  },
  {
    value: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Password, 2FA & sessions',
  },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Alerts & communication prefs',
  },
  {
    value: 'danger',
    label: 'Danger Zone',
    icon: AlertTriangle,
    description: 'Deactivate or delete account',
    destructive: true,
  },
]

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'

  function handleTabChange(value: string) {
    setSearchParams({ tab: value })
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Manage your account settings and preferences." />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col gap-8 md:flex-row md:gap-10"
      >
        {/* Sidebar nav */}
        <aside className="w-full shrink-0 md:w-60">
          <TabsList className="flex h-auto w-full flex-col gap-0.5 bg-transparent p-0">
            {NAV_ITEMS.map(({ value, label, icon: Icon, description, destructive }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={[
                  'group w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all',
                  'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/60 data-[state=inactive]:hover:text-foreground',
                  destructive
                    ? 'data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive'
                    : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary',
                  'data-[state=active]:shadow-none data-[state=active]:font-medium',
                ].join(' ')}
              >
                <Icon
                  className={[
                    'h-4 w-4 shrink-0 transition-colors',
                    destructive
                      ? 'group-data-[state=active]:text-destructive group-data-[state=inactive]:text-muted-foreground'
                      : 'group-data-[state=active]:text-primary group-data-[state=inactive]:text-muted-foreground',
                  ].join(' ')}
                />
                <div className="flex flex-col items-start gap-0.5">
                  <span>{label}</span>
                  <span className="text-[11px] font-normal leading-none text-muted-foreground/70 group-data-[state=active]:text-current/60">
                    {description}
                  </span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </aside>

        {/* Content area */}
        <div className="min-w-0 flex-1">
          <TabsContent value="profile" className="mt-0">
            <ProfileForm />
          </TabsContent>

          <TabsContent value="security" className="mt-0 space-y-6">
            <ChangePasswordForm />
            <TwoFactorSetup />
            <SessionsList />
            <SecurityEvents />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationPreferences />
          </TabsContent>

          <TabsContent value="danger" className="mt-0">
            <DangerZone />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
