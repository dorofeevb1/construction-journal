import { describe, expect, it } from 'vitest';
import { validateEntryForm } from './validation';
import type { EntryFormData } from './types';

const valid: EntryFormData = {
  workDate: '2026-05-26',
  workTypeId: 1,
  volume: 10,
  unit: 'м³',
  workerName: 'Сидоров С.С.',
};

describe('форма записи', () => {
  it('пустая — ругается на поля', () => {
    const errors = validateEntryForm({
      workDate: '',
      workTypeId: '',
      volume: '',
      unit: '',
      workerName: '',
    });
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(4);
  });

  it('заполненная — ок', () => {
    expect(validateEntryForm(valid)).toEqual({});
  });

  it('нулевой объём — ошибка', () => {
    expect(validateEntryForm({ ...valid, volume: 0 }).volume).toBeTruthy();
  });
});
