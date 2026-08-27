import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  staffApi,
  type CreateStaffPayload,
  type StaffActivityParams,
  type StaffListParams,
  type UpdateStaffPayload,
} from '@/lib/api/staff';
import { queryKeys } from '@/lib/query-keys';

export function useStaffList(params: StaffListParams) {
  return useQuery({
    queryKey: queryKeys.staff.list(params),
    queryFn: () => staffApi.list(params),
  });
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: queryKeys.staff.detail(id),
    queryFn: () => staffApi.get(id),
    enabled: !!id,
  });
}

/** Feed plus per-action counts for one staff member, in a single request. */
export function useStaffActivity(id: string, params: StaffActivityParams = {}) {
  return useQuery({
    queryKey: queryKeys.staff.activity(id, params),
    queryFn: () => staffApi.activity(id, params),
    enabled: !!id,
    // Hold the current page on screen while the next one loads.
    placeholderData: (previous) => previous,
  });
}

function useInvalidateStaffViews() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.staff.all });
  };
}

export function useCreateStaff() {
  const invalidate = useInvalidateStaffViews();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => staffApi.create(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateStaff(id: string) {
  const invalidate = useInvalidateStaffViews();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStaffPayload) => staffApi.update(id, payload),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.staff.detail(id) });
    },
  });
}

export function useDeactivateStaff() {
  const invalidate = useInvalidateStaffViews();
  return useMutation({
    mutationFn: (id: string) => staffApi.deactivate(id),
    onSuccess: invalidate,
  });
}

export function useReactivateStaff() {
  const invalidate = useInvalidateStaffViews();
  return useMutation({
    mutationFn: (id: string) => staffApi.reactivate(id),
    onSuccess: invalidate,
  });
}

export function useAssignStaffProperties(id: string) {
  const invalidate = useInvalidateStaffViews();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (propertyIds: string[]) =>
      staffApi.assignProperties(id, propertyIds),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: queryKeys.staff.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
  });
}
