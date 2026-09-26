import { api } from './api.js';
import type { DailySummary } from '../types/analytics.types.js';

export async function fetchDailySummary(
  date?: string,
  timezone?: string
): Promise<DailySummary> {
  const userTimezone =
    timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const response = await api.get<{
    success: boolean;
    summary: DailySummary;
  }>('/analytics/daily-summary', {
    params: {
      date,
      timezone: userTimezone,
    },
  });

  return response.data.summary;
}
