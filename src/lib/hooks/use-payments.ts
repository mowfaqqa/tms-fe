import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  paymentsApi,
  type CreatePaymentPayload,
  type PartPaymentListParams,
} from '@/lib/api/payments';
import { queryKeys } from '@/lib/query-keys';

export function useTenantPayments(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.payments.forTenant(tenantId),
    queryFn: () => paymentsApi.forTenant(tenantId),
    enabled: !!tenantId,
  });
}

export function usePartPayments(params: PartPaymentListParams) {
  return useQuery({
    queryKey: queryKeys.payments.partPayments(params),
    queryFn: () => paymentsApi.partPayments(params),
    placeholderData: (previous) => previous,
  });
}

/**
 * A payment moves the balance, which is embedded in the tenant record and
 * summed on the dashboard and in the report — so all four have to go.
 */
function useInvalidatePayments(tenantId: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.payments.all });
    qc.invalidateQueries({ queryKey: queryKeys.tenants.detail(tenantId) });
    qc.invalidateQueries({ queryKey: queryKeys.tenants.all });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useRecordPayment(tenantId: string) {
  const invalidate = useInvalidatePayments(tenantId);
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) =>
      paymentsApi.record(tenantId, payload),
    onSuccess: invalidate,
  });
}

export function useDeletePayment(tenantId: string) {
  const invalidate = useInvalidatePayments(tenantId);
  return useMutation({
    mutationFn: (paymentId: string) => paymentsApi.remove(paymentId),
    onSuccess: invalidate,
  });
}
