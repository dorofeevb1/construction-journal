import { z } from 'zod';

export const entryBodySchema = z.object({
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата в формате YYYY-MM-DD'),
  workTypeId: z.coerce.number().int().positive('Выберите вид работ'),
  volume: z.coerce.number().positive('Объём должен быть больше 0'),
  unit: z.string().trim().min(1, 'Укажите единицу измерения').max(32),
  workerName: z.string().trim().min(1, 'Укажите ФИО исполнителя').max(255),
});

export type EntryBody = z.infer<typeof entryBodySchema>;
