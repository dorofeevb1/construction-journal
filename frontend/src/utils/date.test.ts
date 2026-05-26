import { describe, expect, it } from 'vitest';
import { formatDisplayDate } from './date';

describe('formatDisplayDate', () => {
  it('ISO → дд.мм.гггг', () => {
    expect(formatDisplayDate('2026-05-26')).toBe('26.05.2026');
  });

  it('мусор возвращает как есть', () => {
    expect(formatDisplayDate('н/д')).toBe('н/д');
  });
});
