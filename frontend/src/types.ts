export interface WorkType {
  id: number;
  name: string;
}

export interface JournalEntry {
  id: number;
  workDate: string;
  workTypeId: number;
  workTypeName: string;
  volume: number;
  unit: string;
  workerName: string;
}

export interface EntryFormData {
  workDate: string;
  workTypeId: number | '';
  volume: number | '';
  unit: string;
  workerName: string;
}

export interface EntryFilters {
  dateFrom: string;
  dateTo: string;
  sort: 'asc' | 'desc';
  q: string;
}

export type FieldErrors = Partial<Record<keyof EntryFormData, string>>;
