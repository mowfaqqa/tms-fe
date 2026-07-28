import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  propertiesApi,
  type PropertyListParams,
  type PropertyPayload,
} from '@/lib/api/properties';
import { queryKeys } from '@/lib/query-keys';

export function useProperties(params: PropertyListParams) {
  return useQuery({
    queryKey: queryKeys.properties.list(params),
    queryFn: () => propertiesApi.list(params),
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

export function useDeleteProperty() {
  const invalidate = useInvalidatePropertyViews();
  return useMutation({
    mutationFn: (id: string) => propertiesApi.remove(id),
    onSuccess: invalidate,
  });
}
