import { Router, type Request, type Response } from 'express';
import { prisma } from '../prisma';
import { entryBodySchema, type EntryBody } from '../validation/entry';

export const entriesRouter = Router();

type EntryWithWorkType = {
  id: number;
  workDate: Date;
  volume: unknown;
  unit: string;
  workerName: string;
  workType: { id: number; name: string };
};

// дата приходит строкой YYYY-MM-DD — кладём в UTC, для колонки DATE хватает
function toWorkDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toJson(row: EntryWithWorkType) {
  return {
    id: row.id,
    workDate: row.workDate.toISOString().slice(0, 10),
    volume: Number(row.volume),
    unit: row.unit,
    workerName: row.workerName,
    workTypeId: row.workType.id,
    workTypeName: row.workType.name,
  };
}

function parseId(raw: string): number | null {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

async function readBody(req: Request, res: Response): Promise<EntryBody | null> {
  const parsed = entryBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten().fieldErrors });
    return null;
  }

  const workType = await prisma.workType.findUnique({ where: { id: parsed.data.workTypeId } });
  if (!workType) {
    res.status(400).json({ error: 'Вид работ не найден' });
    return null;
  }

  return parsed.data;
}

entriesRouter.get('/', async (req, res, next) => {
  try {
    const dateFrom = typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined;
    const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined;
    const sort = req.query.sort === 'asc' ? 'asc' : 'desc';
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    const and: Record<string, unknown>[] = [];

    if (dateFrom || dateTo) {
      const workDate: { gte?: Date; lte?: Date } = {};
      if (dateFrom) workDate.gte = toWorkDate(dateFrom);
      if (dateTo) workDate.lte = toWorkDate(dateTo);
      and.push({ workDate });
    }

    if (q) {
      and.push({
        OR: [
          { workerName: { contains: q, mode: 'insensitive' } },
          { workType: { name: { contains: q, mode: 'insensitive' } } },
        ],
      });
    }

    const where = and.length === 0 ? {} : and.length === 1 ? and[0] : { AND: and };

    const rows = await prisma.journalEntry.findMany({
      where,
      orderBy: { workDate: sort },
      include: { workType: true },
    });

    res.json(rows.map(toJson));
  } catch (err) {
    next(err);
  }
});

entriesRouter.post('/', async (req, res, next) => {
  try {
    const body = await readBody(req, res);
    if (!body) return;

    const row = await prisma.journalEntry.create({
      data: {
        workDate: toWorkDate(body.workDate),
        workTypeId: body.workTypeId,
        volume: body.volume,
        unit: body.unit,
        workerName: body.workerName,
      },
      include: { workType: true },
    });

    res.status(201).json(toJson(row));
  } catch (err) {
    next(err);
  }
});

entriesRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'Некорректный id' });
      return;
    }

    const body = await readBody(req, res);
    if (!body) return;

    const existing = await prisma.journalEntry.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Запись не найдена' });
      return;
    }

    const row = await prisma.journalEntry.update({
      where: { id },
      data: {
        workDate: toWorkDate(body.workDate),
        workTypeId: body.workTypeId,
        volume: body.volume,
        unit: body.unit,
        workerName: body.workerName,
      },
      include: { workType: true },
    });

    res.json(toJson(row));
  } catch (err) {
    next(err);
  }
});

entriesRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'Некорректный id' });
      return;
    }

    const existing = await prisma.journalEntry.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Запись не найдена' });
      return;
    }

    await prisma.journalEntry.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
