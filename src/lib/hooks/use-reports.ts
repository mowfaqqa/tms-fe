import { useQuery } from '@tanstack/react-query';
import { reportsApi, type ReportKey } from '@/lib/api/reports';
import { queryKeys } from '@/lib/query-keys';

export function useReport(key: ReportKey) {
  return useQuery({
    queryKey: queryKeys.reports.detail(key),
    queryFn: () => reportsApi.get(key),
  });
}
