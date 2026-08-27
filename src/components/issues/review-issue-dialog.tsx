'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useChangeIssueStatus } from '@/lib/hooks/use-issues';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ISSUE_STATUS_LABELS } from '@/lib/labels';
import type { Issue, IssueStatus } from '@/lib/types';

/**
 * Statuses the server requires a resolution note for. It rejects the request
 * without one, so the button stays disabled rather than round-tripping to a
 * 400 the admin has to read.
 */
const NEEDS_NOTE: IssueStatus[] = ['RESOLVED', 'REJECTED'];

const PROMPTS: Record<IssueStatus, { title: string; description: string }> = {
  OPEN: {
    title: 'Reopen this issue',
    description:
      'It goes back into the queue and the staff member who reported it is told.',
  },
  IN_REVIEW: {
    title: 'Start reviewing this issue',
    description:
      'The reporter is told you have picked it up, and can no longer edit it.',
  },
  RESOLVED: {
    title: 'Resolve this issue',
    description:
      'Say what was done. The reporter is sent your note word for word.',
  },
  REJECTED: {
    title: 'Decline this issue',
    description:
      'Say why. The reporter is sent your note word for word.',
  },
};

export function ReviewIssueDialog({
  issue,
  status,
  open,
  onOpenChange,
}: {
  issue: Issue;
  /** The status this dialog will move the issue to. */
  status: IssueStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const changeStatus = useChangeIssueStatus(issue.id);
  const [note, setNote] = useState('');

  if (!status) return null;

  const prompt = PROMPTS[status];
  const noteRequired = NEEDS_NOTE.includes(status);

  const submit = () => {
    changeStatus.mutate(
      {
        status,
        ...(note.trim() ? { resolutionNote: note.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast.success(
            `Issue marked ${ISSUE_STATUS_LABELS[status].toLowerCase()}.`,
          );
          setNote('');
          onOpenChange(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setNote('');
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{prompt.title}</DialogTitle>
          <DialogDescription>{prompt.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-sm font-medium">{issue.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reported by {issue.raisedBy?.fullName ?? 'a staff member'}
              {issue.property
                ? ` · ${issue.property.address} (Unit ${issue.property.unitNumber})`
                : ''}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution-note">
              {noteRequired ? 'Resolution note' : 'Note (optional)'}
            </Label>
            <Textarea
              id="resolution-note"
              rows={4}
              value={note}
              placeholder={
                status === 'REJECTED'
                  ? 'Explain why this is being declined.'
                  : 'What was done about it?'
              }
              onChange={(e) => setNote(e.target.value)}
            />
            {noteRequired ? (
              <p className="text-xs text-muted-foreground">
                Required — the reporter sees this.
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={changeStatus.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={
              changeStatus.isPending || (noteRequired && !note.trim())
            }
          >
            {changeStatus.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {ISSUE_STATUS_LABELS[status]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
