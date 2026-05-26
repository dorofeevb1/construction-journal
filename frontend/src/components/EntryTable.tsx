import type { JournalEntry } from '../types';
import { formatDisplayDate } from '../utils/date';

type EntryTableProps = {
  entries: JournalEntry[];
  loading: boolean;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
};

export function EntryTable({ entries, loading, onEdit, onDelete }: EntryTableProps) {
  return (
    <section className="card table-card">
      <h2>Записи</h2>
      {loading ? (
        <p className="muted">Загружаю…</p>
      ) : entries.length === 0 ? (
        <p className="muted">Пока пусто — добавьте запись в форме выше.</p>
      ) : (
        <div className="table-wrap">
          <table data-testid="entries-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Вид работ</th>
                <th>Объём</th>
                <th>Исполнитель</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} data-testid="entry-row" data-entry-id={entry.id}>
                  <td>{formatDisplayDate(entry.workDate)}</td>
                  <td>{entry.workTypeName}</td>
                  <td>
                    {entry.volume} {entry.unit}
                  </td>
                  <td>{entry.workerName}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn btn-link"
                      data-testid="edit-entry"
                      onClick={() => onEdit(entry)}
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      className="btn btn-link btn-danger"
                      data-testid="delete-entry"
                      onClick={() => onDelete(entry)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
