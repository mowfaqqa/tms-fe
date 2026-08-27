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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateIssue } from '@/lib/hooks/use-issues';
import { useProperties } from '@/lib/hooks/use-properties';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ISSUE_CATEGORY_LABELS, ISSUE_PRIORITY_LABELS } from '@/lib/labels';
import type { IssueCategory, IssuePriority } from '@/lib/types';

const CATEGORIES = Object.keys(ISSUE_CATEGORY_LABELS) as IssueCategory[];
const PRIORITIES = Object.keys(ISSUE_PRIORITY_LABELS) as IssuePriority[];

/** Sentinel for the optional property picker — Select has no empty value. */
const NO_PROPERTY = 'none';

export function ReportIssueDialog({
  propertyId,
  tenantId,
  trigger,
}: {
  /** Fixes the issue to one property and hides the picker. */
  propertyId?: string;
  tenantId?: string;
  trigger: React.ReactNode;
}) {
  const createIssue = useCreateIssue();
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('MAINTENANCE');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [selectedProperty, setSelectedProperty] = useState(
    propertyId ?? NO_PROPERTY,
  );

  // Only load a picker list when the property isn't already fixed. The list is
  // scoped server-side, so staff only ever see properties they're assigned to.
  const { data: properties } = useProperties(
    { page: 1, limit: 100 },
    { keepPreviousData: true },
  );

  const reset = () => {
    setTitle('');
    setDescription('');
    setCategory('MAINTENANCE');
    setPriority('MEDIUM');
    setSelectedProperty(propertyId ?? NO_PROPERTY);
  };

  const submit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Give the issue a title and a description.');
      return;
    }
    createIssue.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        ...(selectedProperty !== NO_PROPERTY
          ? { propertyId: selectedProperty }
          : {}),
        ...(tenantId ? { tenantId } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Reported. The admin has been notified.');
          reset();
          setOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
          <DialogDescription>
            Escalate a problem to the admin. You&apos;ll be notified here when
            it is reviewed and resolved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issue-title">Title</Label>
            <Input
              id="issue-title"
              value={title}
              maxLength={200}
              placeholder="Burst pipe in ground floor bathroom"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as IssueCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {ISSUE_CATEGORY_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as IssuePriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {ISSUE_PRIORITY_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {propertyId ? null : (
            <div className="space-y-2">
              <Label>Property (optional)</Label>
              <Select
                value={selectedProperty}
                onValueChange={setSelectedProperty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Not about a specific property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROPERTY}>
                    Not about a specific property
                  </SelectItem>
                  {properties?.data.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.address} (Unit {property.unitNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="issue-description">What happened?</Label>
            <Textarea
              id="issue-description"
              rows={5}
              value={description}
              placeholder="Describe the problem, what you have already done, and what you need from the admin."
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createIssue.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={createIssue.isPending}>
            {createIssue.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Report issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
