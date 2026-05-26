import { describe, expect, it } from 'vitest';
import { entryBodySchema } from './entry';

const valid = {
  workDate: '2026-05-26',
  workTypeId: 1,
  volume: 12.5,
  unit: 'м³',
  workerName: 'Иванов И.И.',
};

describe('entryBodySchema', () => {
  it('нормальное тело проходит', () => {
    expect(entryBodySchema.safeParse(valid).success).toBe(true);
  });

  it('дата не в ISO', () => {
    const r = entryBodySchema.safeParse({ ...valid, workDate: '26.05.2026' });
    expect(r.success).toBe(false);
  });

  it('объём ноль', () => {
    const r = entryBodySchema.safeParse({ ...valid, volume: 0 });
    expect(r.success).toBe(false);
  });

  it('пустая единица', () => {
    const r = entryBodySchema.safeParse({ ...valid, unit: '   ' });
    expect(r.success).toBe(false);
  });

  it('workTypeId строкой тоже ок', () => {
    const r = entryBodySchema.safeParse({ ...valid, workTypeId: '3' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.workTypeId).toBe(3);
  });
});
