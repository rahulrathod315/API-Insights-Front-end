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

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'

  function handleTabChange(value: string) {
    setSearchParams({ tab: value })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account settings and preferences." />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <ChangePasswordForm />
          <TwoFactorSetup />
          <SessionsList />
          <SecurityEvents />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationPreferences />
        </TabsContent>

        <TabsContent value="danger" className="mt-6">
          <DangerZone />
        </TabsContent>
      </Tabs>
    </div>
  )
}
