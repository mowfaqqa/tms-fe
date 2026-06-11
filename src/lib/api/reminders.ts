import { api } from './client';
import type { Reminder } from '@/lib/types';

export interface RunSweepResult {
  triggered: number;
  expiredTenants: number;
}

export const remindersApi = {
  async acknowledge(id: string): Promise<Reminder> {
    const { data } = await api.patch<Reminder>(`/reminders/${id}/acknowledge`);
    return data;
  },

  async runSweep(): Promise<RunSweepResult> {
    const { data } = await api.post<RunSweepResult>('/reminders/run-sweep');
    return data;
  },
};
