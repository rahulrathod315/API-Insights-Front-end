import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Download, Power, Trash2 } from 'lucide-react'
import { deactivateAccount, requestDataExport, requestDeletion } from '../api'
import { useAuth } from '@/lib/auth/auth-context'

export function DangerZone() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [exportMessage, setExportMessage] = useState('')

  async function handleDeactivate() {
    setIsLoading(true)
    try {
      await deactivateAccount()
      await logout()
      navigate('/login')
    } catch {
      setIsLoading(false)
    }
  }

  async function handleExport() {
    setIsLoading(true)
    try {
      await requestDataExport()
      setExportMessage('Data export requested. You will receive an email with your data.')
    } catch {
      setExportMessage('Failed to request data export.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== 'DELETE') return
    setIsLoading(true)
    try {
      await requestDeletion()
      await logout()
      navigate('/login')
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          These actions are irreversible. Please proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deactivate Account */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <h4 className="font-medium">Deactivate Account</h4>
            <p className="text-sm text-muted-foreground">Temporarily deactivate your account. You can reactivate later.</p>
          </div>
          <Button variant="outline" onClick={() => setDeactivateOpen(true)}>
            <Power className="mr-2 h-4 w-4" />
            Deactivate
          </Button>
        </div>

        {/* Export Data */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <h4 className="font-medium">Export Data</h4>
            <p className="text-sm text-muted-foreground">Request a copy of all your data (GDPR).</p>
            {exportMessage && <p className="mt-1 text-sm text-primary">{exportMessage}</p>}
          </div>
          <Button variant="outline" onClick={handleExport} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
          <div>
            <h4 className="font-medium text-destructive">Delete Account</h4>
            <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
          </div>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>

        {/* Deactivate Dialog */}
        <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
              <AlertDialogDescription>
                Your account will be deactivated and you will be logged out. You can reactivate by logging in again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeactivate} disabled={isLoading}>
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Delete Account Permanently</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All your data, projects, and settings will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
              <Input
                id="delete-confirm"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirm('')}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteConfirm !== 'DELETE' || isLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
