'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Plus, Trash2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  useDeletePayment,
  useRecordPayment,
  useTenantPayments,
} from '@/lib/hooks/use-payments';
import { useAuth } from '@/lib/auth/auth-context';
import { getApiErrorMessage } from '@/lib/api/errors';
import { formatDate, formatMoney } from '@/lib/format';

export function PaymentPanel({ tenantId }: { tenantId: string }) {
  const { isAdmin } = useAuth();
  const { data, isLoading } = useTenantPayments(tenantId);
  const deletePayment = useDeletePayment(tenantId);
  const [recordOpen, setRecordOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }
  if (!data) return null;

  const { summary, payments, rentAmount, isPartPayment } = data;
  // Worth showing whenever money has been taken, even if the tenancy was
  // never flagged — a recorded payment should never be invisible.
  if (!isPartPayment && payments.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-4" />
          Payments
          {isPartPayment ? (
            <StatusBadge
              label={summary.isFullyPaid ? 'Settled' : 'Part payment'}
              tone={summary.isFullyPaid ? 'success' : 'destructive'}
            />
          ) : null}
        </CardTitle>
        {/* CardHeader is a grid that gives CardAction its own right-hand
            column; a flex override here would simply be ignored. */}
        <CardAction>
          <Button size="sm" onClick={() => setRecordOpen(true)}>
            <Plus className="size-4" />
            Record payment
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Figure label="Rent" value={formatMoney(rentAmount)} />
          <Figure label="Paid" value={formatMoney(summary.amountPaid)} />
          <Figure
            label="Outstanding"
            value={formatMoney(summary.outstanding)}
            emphasis={!summary.isFullyPaid}
          />
        </div>

        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing recorded yet.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex items-center justify-between gap-3 p-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{formatMoney(payment.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(payment.paidAt)}
                    {payment.method ? ` · ${payment.method}` : ''}
                    {payment.reference ? ` · ${payment.reference}` : ''}
                    {payment.recordedBy
                      ? ` · recorded by ${payment.recordedBy.fullName}`
                      : ''}
                  </p>
                  {payment.note ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {payment.note}
                    </p>
                  ) : null}
                </div>
                {/* Removing a payment is a correction to a financial record,
                    so the server keeps it to admins and so does the UI. */}
                {isAdmin ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setPendingDelete(payment.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <RecordPaymentDialog
        tenantId={tenantId}
        outstanding={summary.outstanding}
        open={recordOpen}
        onOpenChange={setRecordOpen}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Remove this payment record?"
        description="The balance will go back up by this amount. This cannot be undone."
        confirmLabel="Remove"
        destructive
        loading={deletePayment.isPending}
        onConfirm={() =>
          pendingDelete &&
          deletePayment.mutate(pendingDelete, {
            onSuccess: () => {
              toast.success('Payment removed.');
              setPendingDelete(null);
            },
            onError: (e) => toast.error(getApiErrorMessage(e)),
          })
        }
      />
    </Card>
  );
}

function Figure({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          emphasis
            ? 'text-lg font-semibold text-amber-600 dark:text-amber-500'
            : 'text-lg font-semibold'
        }
      >
        {value}
      </p>
    </div>
  );
}

function RecordPaymentDialog({
  tenantId,
  outstanding,
  open,
  onOpenChange,
}: {
  tenantId: string;
  outstanding: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const record = useRecordPayment(tenantId);
  const [amount, setAmount] = useState('');
  const [paidAt, setPaidAt] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [method, setMethod] = useState('');
  const [reference, setReference] = useState('');

  const openChanged = (next: boolean) => {
    if (next) {
      setAmount('');
      setPaidAt(format(new Date(), 'yyyy-MM-dd'));
      setMethod('');
      setReference('');
    }
    onOpenChange(next);
  };

  const submit = () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error('Enter the amount received.');
      return;
    }
    record.mutate(
      {
        amount: value,
        paidAt,
        ...(method.trim() ? { method: method.trim() } : {}),
        ...(reference.trim() ? { reference: reference.trim() } : {}),
      },
      {
        onSuccess: (result) => {
          toast.success('Payment recorded.', {
            description: result.summary.isFullyPaid
              ? 'The rent is now fully paid.'
              : `${formatMoney(result.summary.outstanding)} still outstanding.`,
          });
          onOpenChange(false);
        },
        onError: (e) => toast.error(getApiErrorMessage(e)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={openChanged}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>
            {formatMoney(outstanding)} outstanding on this tenancy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Amount received</Label>
            <Input
              id="payment-amount"
              type="number"
              min={0}
              value={amount}
              placeholder="200000"
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-date">Date received</Label>
            <Input
              id="payment-date"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Method (optional)</Label>
              <Input
                id="payment-method"
                value={method}
                placeholder="Bank transfer"
                onChange={(e) => setMethod(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-reference">Reference (optional)</Label>
              <Input
                id="payment-reference"
                value={reference}
                placeholder="TRF/8842190"
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={record.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={record.isPending}>
            {record.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Record payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
