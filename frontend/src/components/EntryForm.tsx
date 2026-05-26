import type { EntryFormData, FieldErrors, WorkType } from '../types';

type EntryFormProps = {
  form: EntryFormData;
  errors: FieldErrors;
  workTypes: WorkType[];
  editingId: number | null;
  saving: boolean;
  onChange: (form: EntryFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

const unitOptions = ['м³', 'м²', 'п.м.', 'шт.', 'т', 'кг'];

export function EntryForm({
  form,
  errors,
  workTypes,
  editingId,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: EntryFormProps) {
  const updateField = <K extends keyof EntryFormData>(key: K, value: EntryFormData[K]) => {
    onChange({ ...form, [key]: value });
  };

  return (
    <section className="card form-card">
      <h2>{editingId ? 'Правка записи' : 'Новая запись'}</h2>
      <form
        data-testid="entry-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="form-grid">
          <label className="field">
            <span>Дата</span>
            <input
              type="date"
              data-testid="field-work-date"
              value={form.workDate}
              onChange={(e) => updateField('workDate', e.target.value)}
            />
            {errors.workDate && <em className="error">{errors.workDate}</em>}
          </label>

          <label className="field">
            <span>Вид работ</span>
            <select
              data-testid="field-work-type"
              value={form.workTypeId}
              onChange={(e) =>
                updateField('workTypeId', e.target.value === '' ? '' : Number(e.target.value))
              }
            >
              <option value="">— выберите —</option>
              {workTypes.map((wt) => (
                <option key={wt.id} value={wt.id}>
                  {wt.name}
                </option>
              ))}
            </select>
            {errors.workTypeId && <em className="error">{errors.workTypeId}</em>}
          </label>

          <label className="field">
            <span>Объём</span>
            <input
              type="number"
              min="0"
              step="any"
              data-testid="field-volume"
              value={form.volume}
              onChange={(e) =>
                updateField('volume', e.target.value === '' ? '' : Number(e.target.value))
              }
            />
            {errors.volume && <em className="error">{errors.volume}</em>}
          </label>

          <label className="field">
            <span>Ед. изм.</span>
            <select
              data-testid="field-unit"
              value={unitOptions.includes(form.unit) ? form.unit : unitOptions[0]}
              onChange={(e) => updateField('unit', e.target.value)}
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            {errors.unit && <em className="error">{errors.unit}</em>}
          </label>

          <label className="field field-wide">
            <span>Исполнитель (ФИО)</span>
            <input
              type="text"
              maxLength={255}
              data-testid="field-worker"
              value={form.workerName}
              onChange={(e) => updateField('workerName', e.target.value)}
              placeholder="Иванов И.И."
            />
            {errors.workerName && <em className="error">{errors.workerName}</em>}
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" data-testid="submit-entry" disabled={saving}>
            {saving ? 'Пишу в журнал…' : editingId ? 'Сохранить' : 'Добавить в журнал'}
          </button>
          {editingId !== null && (
            <button type="button" className="btn btn-secondary" data-testid="cancel-edit" onClick={onCancel}>
              Отмена
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
