import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  tenantsApi,
  type RenewTenancyPayload,
  type TenantListParams,
  type TenantPayload,
} from '@/lib/api/tenants';
import { queryKeys } from '@/lib/query-keys';

export function useTenants(params: TenantListParams) {
  return useQuery({
    queryKey: queryKeys.tenants.list(params),
    queryFn: () => tenantsApi.list(params),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: queryKeys.tenants.detail(id),
    queryFn: () => tenantsApi.get(id),
    enabled: !!id,
  });
}

export function useTenantReminders(id: string) {
  return useQuery({
    queryKey: queryKeys.tenants.reminders(id),
    queryFn: () => tenantsApi.reminders(id),
    enabled: !!id,
  });
}

export function useTenantNotices(id: string) {
  return useQuery({
    queryKey: queryKeys.tenants.notices(id),
    queryFn: () => tenantsApi.notices(id),
    enabled: !!id,
  });
}

function useInvalidateTenantViews() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.tenants.all });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useCreateTenant() {
  const invalidate = useInvalidateTenantViews();
  return useMutation({
    mutationFn: (payload: TenantPayload) => tenantsApi.create(payload),
    onSuccess: invalidate,
  });
}

/**
 * Renewing touches both terms — the old one becomes RENEWED — so the
 * superseded record's cached detail is dropped alongside the usual views.
 */
export function useRenewTenancy(id: string) {
  const invalidate = useInvalidateTenantViews();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RenewTenancyPayload) => tenantsApi.renew(id, payload),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.tenants.detail(id) });
      qc.invalidateQueries({ queryKey: ['properties'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateTenant(id: string) {
  const invalidate = useInvalidateTenantViews();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TenantPayload>) =>
      tenantsApi.update(id, payload),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.tenants.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.tenants.reminders(id) });
    },
  });
}

export function useDeleteTenant() {
  const invalidate = useInvalidateTenantViews();
  return useMutation({
    mutationFn: (id: string) => tenantsApi.remove(id),
    onSuccess: invalidate,
  });
}
