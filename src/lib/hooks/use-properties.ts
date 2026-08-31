import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  propertiesApi,
  type ConfirmVacancyPayload,
  type PropertyListParams,
  type PropertyPayload,
} from '@/lib/api/properties';
import { queryKeys } from '@/lib/query-keys';

export function useProperties(
  params: PropertyListParams,
  options?: { keepPreviousData?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.properties.list(params),
    queryFn: () => propertiesApi.list(params),
    placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: queryKeys.properties.detail(id),
    queryFn: () => propertiesApi.get(id),
    enabled: !!id,
  });
}

export function usePropertyTenants(id: string) {
  return useQuery({
    queryKey: queryKeys.properties.tenants(id),
    queryFn: () => propertiesApi.tenants(id),
    enabled: !!id,
  });
}

function useInvalidatePropertyViews() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.properties.all });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useCreateProperty() {
  const invalidate = useInvalidatePropertyViews();
  return useMutation({
    mutationFn: (payload: PropertyPayload) => propertiesApi.create(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateProperty(id: string) {
  const invalidate = useInvalidatePropertyViews();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PropertyPayload>) =>
      propertiesApi.update(id, payload),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.properties.detail(id) });
    },
  });
}

/**
 * Confirming or reversing a vacancy moves a tenancy too (an early move-out
 * closes the term), so the tenant views are dropped alongside the property
 * ones — otherwise the tenant list keeps showing the tenancy as running.
 */
function useInvalidateVacancyViews(id: string) {
  const invalidate = useInvalidatePropertyViews();
  const qc = useQueryClient();
  return () => {
    invalidate();
    qc.invalidateQueries({ queryKey: queryKeys.properties.detail(id) });
    qc.invalidateQueries({ queryKey: queryKeys.properties.tenants(id) });
    qc.invalidateQueries({ queryKey: ['tenants'] });
    qc.invalidateQueries({ queryKey: ['reports'] });
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };
}

export function useConfirmVacancy(id: string) {
  const invalidate = useInvalidateVacancyViews(id);
  return useMutation({
    mutationFn: (payload: ConfirmVacancyPayload) =>
      propertiesApi.confirmVacancy(id, payload),
    onSuccess: invalidate,
  });
}

export function useClearVacancy(id: string) {
  const invalidate = useInvalidateVacancyViews(id);
  return useMutation({
    mutationFn: () => propertiesApi.clearVacancy(id),
    onSuccess: invalidate,
  });
}

export function useDeleteProperty() {
  const invalidate = useInvalidatePropertyViews();
  return useMutation({
    mutationFn: (id: string) => propertiesApi.remove(id),
    onSuccess: invalidate,
  });
}
