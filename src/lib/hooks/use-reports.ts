import { useQuery } from '@tanstack/react-query';
import {
  reportsApi,
  type ReportKey,
  type ReportParams,
} from '@/lib/api/reports';
import { queryKeys } from '@/lib/query-keys';

export function useReport<K extends ReportKey>(
  key: K,
  enabled = true,
  params: ReportParams = {},
) {
  return useQuery({
    queryKey: queryKeys.reports.detail(key, params),
    queryFn: () => reportsApi.get(key, params),
    enabled,
    // Keeps the previous page on screen while the next one loads, instead of
    // collapsing the table back to its skeleton on every page change.
    placeholderData: (previous) => previous,
  });
}

export function useStaffActivitySummary(
  params: ReportParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.reports.staffActivitySummary(params),
    queryFn: () => reportsApi.staffActivitySummary(params),
    enabled,
  });
}
