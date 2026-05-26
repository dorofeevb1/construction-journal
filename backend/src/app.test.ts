import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from './app';

const prismaMock = vi.hoisted(() => ({
  workType: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  journalEntry: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('./prisma', () => ({ prisma: prismaMock }));

describe('routes', () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('work-types', async () => {
    prismaMock.workType.findMany.mockResolvedValue([{ id: 1, name: 'Кладка' }]);
    const res = await request(app).get('/api/work-types');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, name: 'Кладка' }]);
  });

  it('POST /entries без тела — 400', async () => {
    const res = await request(app).post('/api/entries').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Ошибка валидации');
  });

  it('POST /entries — нет такого вида работ', async () => {
    prismaMock.workType.findUnique.mockResolvedValue(null);
    const res = await request(app).post('/api/entries').send({
      workDate: '2026-05-26',
      workTypeId: 99,
      volume: 5,
      unit: 'м²',
      workerName: 'Тест',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Вид работ не найден');
  });

  it('POST /entries — ok', async () => {
    prismaMock.workType.findUnique.mockResolvedValue({ id: 1, name: 'Кладка' });
    prismaMock.journalEntry.create.mockResolvedValue({
      id: 7,
      workDate: new Date('2026-05-26T00:00:00.000Z'),
      volume: 5,
      unit: 'м²',
      workerName: 'Петров',
      workType: { id: 1, name: 'Кладка' },
    });

    const res = await request(app).post('/api/entries').send({
      workDate: '2026-05-26',
      workTypeId: 1,
      volume: 5,
      unit: 'м²',
      workerName: 'Петров',
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(7);
    expect(res.body.workTypeName).toBe('Кладка');
  });

  it('DELETE /entries/:id — 204', async () => {
    prismaMock.journalEntry.findUnique.mockResolvedValue({ id: 3 });
    prismaMock.journalEntry.delete.mockResolvedValue({});
    const res = await request(app).delete('/api/entries/3');
    expect(res.status).toBe(204);
  });
});
