import { useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersApi } from '@/lib/api/reminders';
import { queryKeys } from '@/lib/query-keys';

export function useAcknowledgeReminder(tenantId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remindersApi.acknowledge(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.upcomingActions });
      if (tenantId) {
        qc.invalidateQueries({
          queryKey: queryKeys.tenants.reminders(tenantId),
        });
      }
    },
  });
}

export function useRunSweep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => remindersApi.runSweep(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      qc.invalidateQueries({ queryKey: queryKeys.tenants.all });
    },
  });
}
