import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  issuesApi,
  type ChangeIssueStatusPayload,
  type CreateIssuePayload,
  type IssueListParams,
  type UpdateIssuePayload,
} from '@/lib/api/issues';
import { queryKeys } from '@/lib/query-keys';

export function useIssues(params: IssueListParams) {
  return useQuery({
    queryKey: queryKeys.issues.list(params),
    queryFn: () => issuesApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useIssueSummary(enabled = true) {
  return useQuery({
    queryKey: queryKeys.issues.summary,
    queryFn: () => issuesApi.summary(),
    enabled,
  });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: queryKeys.issues.detail(id),
    queryFn: () => issuesApi.get(id),
    enabled: !!id,
  });
}

function useInvalidateIssues() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: queryKeys.issues.all });
    // Raising or closing an issue notifies someone, and both show up in the
    // audit log, so neither the bell nor the activity feed is still current.
    qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    qc.invalidateQueries({ queryKey: ['reports'] });
    if (id) qc.invalidateQueries({ queryKey: queryKeys.issues.detail(id) });
  };
}

export function useCreateIssue() {
  const invalidate = useInvalidateIssues();
  return useMutation({
    mutationFn: (payload: CreateIssuePayload) => issuesApi.create(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateIssue(id: string) {
  const invalidate = useInvalidateIssues();
  return useMutation({
    mutationFn: (payload: UpdateIssuePayload) => issuesApi.update(id, payload),
    onSuccess: () => invalidate(id),
  });
}

export function useChangeIssueStatus(id: string) {
  const invalidate = useInvalidateIssues();
  return useMutation({
    mutationFn: (payload: ChangeIssueStatusPayload) =>
      issuesApi.changeStatus(id, payload),
    onSuccess: () => invalidate(id),
  });
}
