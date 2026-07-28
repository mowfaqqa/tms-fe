'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2 } from 'lucide-react';
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
import { useCreateNotice } from '@/lib/hooks/use-notices';
import { useTenants } from '@/lib/hooks/use-tenants';
import { getApiErrorMessage } from '@/lib/api/errors';
import type { NoticeType } from '@/lib/types';

const TYPE_OPTIONS: { value: NoticeType; label: string }[] = [
  { value: 'QUIT', label: 'Notice to Quit' },
  { value: 'RENEWAL', label: 'Renewal Notice' },
  { value: 'GENERAL', label: 'General Notice' },
];

export function GenerateNoticeDialog({
  tenantId,
  tenantName,
  trigger,
}: {
  tenantId?: string;
  tenantName?: string;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const createNotice = useCreateNotice();
  const [open, setOpen] = useState(false);

  const [selectedTenant, setSelectedTenant] = useState<string>(tenantId ?? '');
  const [type, setType] = useState<NoticeType>('QUIT');
  const [noticePeriodDays, setNoticePeriodDays] = useState('30');
  const [proposedRentAmount, setProposedRentAmount] = useState('');
  const [renewalTermMonths, setRenewalTermMonths] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Only fetch a tenant list when we need a picker (no fixed tenant).
  const { data: tenantsData } = useTenants(
    tenantId ? { page: 1, limit: 1 } : { page: 1, limit: 100 },
  );

  const reset = () => {
    setType('QUIT');
    setNoticePeriodDays('30');
    setProposedRentAmount('');
    setRenewalTermMonths('');
    setCustomMessage('');
    if (!tenantId) setSelectedTenant('');
  };

  const submit = () => {
    if (!selectedTenant) {
      toast.error('Please select a tenant.');
      return;
    }
    createNotice.mutate(
      {
        tenantId: selectedTenant,
        type,
        ...(type === 'QUIT' && noticePeriodDays
          ? { noticePeriodDays: Number(noticePeriodDays) }
          : {}),
        ...(type === 'RENEWAL' && proposedRentAmount
          ? { proposedRentAmount: Number(proposedRentAmount) }
          : {}),
        ...(type === 'RENEWAL' && renewalTermMonths
          ? { renewalTermMonths: Number(renewalTermMonths) }
          : {}),
        ...(customMessage ? { customMessage } : {}),
      },
      {
        onSuccess: (notice) => {
          toast.success('Draft notice generated.');
          setOpen(false);
          reset();
          router.push(`/notices/${notice.id}`);
        },
        onError: (e) => toast.error(getApiErrorMessage(e)),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Generate notice
          </DialogTitle>
          <DialogDescription>
            {tenantName
              ? `Create a notice for ${tenantName}. You can review and edit the draft before issuing.`
              : 'Select a tenant and notice type. You can review and edit the draft before issuing.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!tenantId ? (
            <div className="space-y-2">
              <Label>Tenant</Label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenantsData?.data.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.fullName} — {t.property?.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Notice type</Label>
            <Select value={type} onValueChange={(v) => setType(v as NoticeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === 'QUIT' ? (
            <div className="space-y-2">
              <Label>Notice period (days)</Label>
              <Input
                type="number"
                min="0"
                value={noticePeriodDays}
                onChange={(e) => setNoticePeriodDays(e.target.value)}
              />
            </div>
          ) : null}

          {type === 'RENEWAL' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Proposed rent (optional)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="2000000"
                  value={proposedRentAmount}
                  onChange={(e) => setProposedRentAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Renewal term, months (optional)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="12"
                  value={renewalTermMonths}
                  onChange={(e) => setRenewalTermMonths(e.target.value)}
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>
              {type === 'GENERAL' ? 'Message' : 'Additional message (optional)'}
            </Label>
            <Textarea
              rows={3}
              placeholder="Add any custom wording…"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createNotice.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={createNotice.isPending}>
            {createNotice.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Generate draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
