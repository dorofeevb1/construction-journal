import type { EntryFormData, EntryFilters, JournalEntry, WorkType } from '../types';

const apiBase = import.meta.env.VITE_API_URL ?? '';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof body.error === 'string' ? body.error : `Ошибка запроса (${res.status})`;
    const err = new Error(message) as Error & { details?: Record<string, string[]> };
    if (body.details) err.details = body.details;
    throw err;
  }

  return body as T;
}

export function fetchWorkTypes(): Promise<WorkType[]> {
  return api<WorkType[]>('/api/work-types');
}

export function fetchEntries(filters: EntryFilters): Promise<JournalEntry[]> {
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.q.trim()) params.set('q', filters.q.trim());
  params.set('sort', filters.sort);
  const query = params.toString();
  return api<JournalEntry[]>(`/api/entries${query ? `?${query}` : ''}`);
}

export function createEntry(data: EntryFormData): Promise<JournalEntry> {
  return api<JournalEntry>('/api/entries', {
    method: 'POST',
    body: JSON.stringify(formToBody(data)),
  });
}

export function updateEntry(id: number, data: EntryFormData): Promise<JournalEntry> {
  return api<JournalEntry>(`/api/entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(formToBody(data)),
  });
}

export function deleteEntry(id: number): Promise<void> {
  return api<void>(`/api/entries/${id}`, { method: 'DELETE' });
}

function formToBody(data: EntryFormData) {
  return {
    workDate: data.workDate,
    workTypeId: Number(data.workTypeId),
    volume: Number(data.volume),
    unit: data.unit.trim(),
    workerName: data.workerName.trim(),
  };
}
