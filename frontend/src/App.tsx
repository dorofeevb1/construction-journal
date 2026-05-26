import { useCallback, useEffect, useState } from 'react';
import {
  createEntry,
  deleteEntry,
  fetchEntries,
  fetchWorkTypes,
  updateEntry,
} from './api/client';
import { ConfirmModal } from './components/ConfirmModal';
import { EntryFiltersBar } from './components/EntryFilters';
import { EntryForm } from './components/EntryForm';
import { EntryTable } from './components/EntryTable';
import type { EntryFilters, EntryFormData, FieldErrors, JournalEntry, WorkType } from './types';
import { formatDisplayDate } from './utils/date';
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

const defaultFilters: EntryFilters = { dateFrom: '', dateTo: '', sort: 'desc', q: '' };

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
  const [deleting, setDeleting] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);

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

  const handleDeleteRequest = (entry: JournalEntry) => {
    setEntryToDelete(entry);
  };

  const handleDeleteCancel = () => {
    if (!deleting) setEntryToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    setDeleting(true);
    setBannerError(null);
    const id = entryToDelete.id;
    try {
      await deleteEntry(id);
      setEntryToDelete(null);
      if (editingId === id) resetForm();
      await loadEntries(appliedFilters);
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : 'Не удалось удалить');
    } finally {
      setDeleting(false);
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
        onDelete={handleDeleteRequest}
      />

      <p className="page-footer">журнал работ · учёт на объекте</p>

      {entryToDelete && (
        <ConfirmModal
          title="Удалить запись?"
          message={`Запись от ${formatDisplayDate(entryToDelete.workDate)} — «${entryToDelete.workTypeName}», ${entryToDelete.volume} ${entryToDelete.unit}, ${entryToDelete.workerName}. Это действие нельзя отменить.`}
          confirmLabel={deleting ? 'Удаляю…' : 'Удалить'}
          busy={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
