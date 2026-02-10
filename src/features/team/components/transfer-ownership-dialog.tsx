import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'
import { useProjectContext } from '@/features/projects/project-context'
import { useTransferOwnership } from '../hooks'
import type { TeamMember } from '../types'

interface TransferOwnershipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: TeamMember[]
  projectName: string
}

function TransferOwnershipDialog({
  open,
  onOpenChange,
  members,
  projectName,
}: TransferOwnershipDialogProps) {
  const { project } = useProjectContext()
  const transferMutation = useTransferOwnership()

  const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('')
  const [confirmationText, setConfirmationText] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)

  const eligibleMembers = members.filter((m) => m.role !== 'owner')
  const isConfirmed = confirmationText === projectName
  const canSubmit = !!selectedMemberId && isConfirmed && !transferMutation.isPending

  async function handleTransfer() {
    if (!canSubmit) return
    setApiError(null)

    try {
      await transferMutation.mutateAsync({
        projectId: String(project.id),
        data: { user_id: selectedMemberId as number },
      })
      handleOpenChange(false)
    } catch {
      setApiError('Failed to transfer ownership. Please try again.')
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedMemberId('')

      setConfirmationText('')
      setApiError(null)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer project ownership</DialogTitle>
          <DialogDescription>
            Transfer ownership of this project to another team member. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={cn(
              'flex items-start gap-3 rounded-md border border-warning/50 bg-warning/10 p-3 text-sm'
            )}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-warning-foreground">
              You will lose owner privileges and become an admin. The new owner
              will have full control over this project, including the ability to
              remove you.
            </p>
          </div>

          {apiError && (
            <div
              className={cn(
                'rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive'
              )}
              role="alert"
            >
              {apiError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="transfer-member">New owner</Label>
            <Select value={selectedMemberId ? String(selectedMemberId) : ''} onValueChange={(value) => setSelectedMemberId(Number(value))}>
              <SelectTrigger id="transfer-member">
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.map((member) => (
                  <SelectItem key={member.id} value={String(member.user.id)}>
                    {member.user.first_name} {member.user.last_name} ({member.user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-confirm">
              Type <span className="font-semibold">{projectName}</span> to confirm
            </Label>
            <Input
              id="transfer-confirm"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={projectName}
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={transferMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleTransfer}
            disabled={!canSubmit}
          >
            {transferMutation.isPending
              ? 'Transferring...'
              : 'Transfer ownership'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { TransferOwnershipDialog }
export type { TransferOwnershipDialogProps }
