import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  noticesApi,
  type CreateNoticePayload,
  type NoticeListParams,
} from '@/lib/api/notices';
import { queryKeys } from '@/lib/query-keys';

export function useNotices(params: NoticeListParams) {
  return useQuery({
    queryKey: queryKeys.notices.list(params),
    queryFn: () => noticesApi.list(params),
  });
}

export function useNotice(id: string) {
  return useQuery({
    queryKey: queryKeys.notices.detail(id),
    queryFn: () => noticesApi.get(id),
    enabled: !!id,
  });
}

function useInvalidateNotices() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: queryKeys.notices.all });
    qc.invalidateQueries({ queryKey: ['tenants'] });
    if (id) qc.invalidateQueries({ queryKey: queryKeys.notices.detail(id) });
  };
}

export function useCreateNotice() {
  const invalidate = useInvalidateNotices();
  return useMutation({
    mutationFn: (payload: CreateNoticePayload) => noticesApi.create(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateNotice(id: string) {
  const invalidate = useInvalidateNotices();
  return useMutation({
    mutationFn: (payload: { title?: string; body?: string }) =>
      noticesApi.update(id, payload),
    onSuccess: () => invalidate(id),
  });
}

export function useIssueNotice(id: string) {
  const invalidate = useInvalidateNotices();
  return useMutation({
    mutationFn: () => noticesApi.issue(id),
    onSuccess: () => invalidate(id),
  });
}

export function useDeleteNotice() {
  const invalidate = useInvalidateNotices();
  return useMutation({
    mutationFn: (id: string) => noticesApi.remove(id),
    onSuccess: () => invalidate(),
  });
}
