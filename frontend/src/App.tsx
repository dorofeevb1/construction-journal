import { useCallback, useEffect, useState } from 'react';
import {
  createEntry,
  deleteEntry,
  fetchEntries,
  fetchWorkTypes,
  updateEntry,
} from './api/client';
import { EntryFiltersBar } from './components/EntryFilters';
import { EntryForm } from './components/EntryForm';
import { EntryTable } from './components/EntryTable';
import type { EntryFilters, EntryFormData, FieldErrors, JournalEntry, WorkType } from './types';
import { mapApiFieldErrors, validateEntryForm } from './validation';

function emptyForm(): EntryFormData {
  return {
    workDate: new Date().toISOString().slice(0, 10),
    workTypeId: '',
    volume: '',
    unit: 'м³',
    workerName: '',
  };
}

const defaultFilters: EntryFilters = { dateFrom: '', dateTo: '', sort: 'desc' };

export default function App() {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filters, setFilters] = useState<EntryFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<EntryFilters>(defaultFilters);
  const [form, setForm] = useState<EntryFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const loadEntries = useCallback(async (activeFilters: EntryFilters) => {
    setLoading(true);
    setBannerError(null);
    try {
      setEntries(await fetchEntries(activeFilters));
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : 'Не вышло загрузить записи');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkTypes()
      .then(setWorkTypes)
      .catch(() => setBannerError('Справочник работ не подгрузился — обновите страницу'));
  }, []);

  useEffect(() => {
    loadEntries(appliedFilters);
  }, [appliedFilters, loadEntries]);

  const resetForm = () => {
    setForm(emptyForm());
    setFormErrors({});
    setEditingId(null);
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setForm({
      workDate: entry.workDate,
      workTypeId: entry.workTypeId,
      volume: entry.volume,
      unit: entry.unit,
      workerName: entry.workerName,
    });
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    const errors = validateEntryForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setBannerError(null);
    try {
      if (editingId !== null) {
        await updateEntry(editingId, form);
      } else {
        await createEntry(form);
      }
      resetForm();
      await loadEntries(appliedFilters);
    } catch (e) {
      const err = e as Error & { details?: Record<string, string[]> };
      if (err.details) setFormErrors(mapApiFieldErrors(err.details));
      else setBannerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry: JournalEntry) => {
    if (!window.confirm(`Убрать запись от ${entry.workDate} (${entry.workTypeName})?`)) return;

    setBannerError(null);
    try {
      await deleteEntry(entry.id);
      if (editingId === entry.id) resetForm();
      await loadEntries(appliedFilters);
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : 'Не удалось удалить');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Журнал работ</h1>
        <p className="subtitle">Что сделали на объекте и кто делал</p>
      </header>

      {bannerError && (
        <div className="banner banner-error" role="alert" data-testid="banner-error">
          {bannerError}
        </div>
      )}

      <EntryForm
        form={form}
        errors={formErrors}
        workTypes={workTypes}
        editingId={editingId}
        saving={saving}
        onChange={setForm}
        onSubmit={handleSave}
        onCancel={resetForm}
      />

      <EntryFiltersBar
        filters={filters}
        onChange={setFilters}
        onApply={() => setAppliedFilters({ ...filters })}
      />

      <EntryTable
        entries={entries}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <p className="page-footer">журнал работ · учёт на объекте</p>
    </div>
  );
}
