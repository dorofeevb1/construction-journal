import type { EntryFilters } from '../types';

type EntryFiltersProps = {
  filters: EntryFilters;
  onChange: (filters: EntryFilters) => void;
  onApply: () => void;
};

export function EntryFiltersBar({ filters, onChange, onApply }: EntryFiltersProps) {
  const update = <K extends keyof EntryFilters>(key: K, value: EntryFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="card filters-card">
      <h2>Отбор и поиск</h2>
      <div className="filters-row">
        <label className="field field-search">
          <span>Поиск</span>
          <input
            type="search"
            data-testid="filter-search"
            placeholder="ФИО или вид работ"
            value={filters.q}
            onChange={(e) => update('q', e.target.value)}
          />
        </label>
        <label className="field">
          <span>С</span>
          <input
            type="date"
            data-testid="filter-date-from"
            value={filters.dateFrom}
            onChange={(e) => update('dateFrom', e.target.value)}
          />
        </label>
        <label className="field">
          <span>По</span>
          <input
            type="date"
            data-testid="filter-date-to"
            value={filters.dateTo}
            onChange={(e) => update('dateTo', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Порядок</span>
          <select
            data-testid="filter-sort"
            value={filters.sort}
            onChange={(e) => update('sort', e.target.value as EntryFilters['sort'])}
          >
            <option value="desc">Сначала новые</option>
            <option value="asc">Сначала старые</option>
          </select>
        </label>
        <button type="button" className="btn btn-primary" data-testid="filter-apply" onClick={onApply}>
          Показать
        </button>
      </div>
    </section>
  );
}
