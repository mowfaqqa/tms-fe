import { api } from './client';
import type {
  Paginated,
  PartPaymentRow,
  PaymentSummary,
  TenantPayment,
  TenantPaymentLedger,
} from '@/lib/types';

export interface CreatePaymentPayload {
  amount: number;
  paidAt: string;
  method?: string;
  reference?: string;
  note?: string;
}

export interface PartPaymentListParams {
  page?: number;
  limit?: number;
  /** Defaults to true server-side — settled arrangements are hidden. */
  outstandingOnly?: boolean;
}

export const paymentsApi = {
  async forTenant(tenantId: string): Promise<TenantPaymentLedger> {
    const { data } = await api.get<TenantPaymentLedger>(
      `/tenants/${tenantId}/payments`,
    );
    return data;
  },

  async record(
    tenantId: string,
    payload: CreatePaymentPayload,
  ): Promise<{ payment: TenantPayment; summary: PaymentSummary }> {
    const { data } = await api.post(`/tenants/${tenantId}/payments`, payload);
    return data;
  },

  async remove(paymentId: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/payments/${paymentId}`);
    return data;
  },

  async partPayments(
    params: PartPaymentListParams,
  ): Promise<Paginated<PartPaymentRow>> {
    const { data } = await api.get<Paginated<PartPaymentRow>>(
      '/reports/part-payments',
      { params },
    );
    return data;
  },
};
