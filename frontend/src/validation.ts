import type { EntryFormData, FieldErrors } from './types';

export function validateEntryForm(data: EntryFormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.workDate) {
    errors.workDate = 'Укажите дату';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.workDate)) {
    errors.workDate = 'Формат: ГГГГ-ММ-ДД';
  }

  if (data.workTypeId === '' || Number(data.workTypeId) < 1) {
    errors.workTypeId = 'Выберите вид работ';
  }

  const volume = Number(data.volume);
  if (data.volume === '' || Number.isNaN(volume)) {
    errors.volume = 'Укажите объём';
  } else if (volume <= 0) {
    errors.volume = 'Объём должен быть больше 0';
  }

  const unit = data.unit.trim();
  if (!unit) {
    errors.unit = 'Укажите единицу измерения';
  } else if (unit.length > 32) {
    errors.unit = 'Не более 32 символов';
  }

  const workerName = data.workerName.trim();
  if (!workerName) {
    errors.workerName = 'Укажите ФИО исполнителя';
  } else if (workerName.length > 255) {
    errors.workerName = 'Не более 255 символов';
  }

  return errors;
}

export function mapApiFieldErrors(details: Record<string, string[]>): FieldErrors {
  const errors: FieldErrors = {};
  (Object.keys(details) as (keyof EntryFormData)[]).forEach((key) => {
    const msg = details[key]?.[0];
    if (msg) errors[key] = msg;
  });
  return errors;
}
