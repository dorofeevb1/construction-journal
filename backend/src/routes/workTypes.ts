import { Router } from 'express';
import { prisma } from '../prisma';

export const workTypesRouter = Router();

workTypesRouter.get('/', async (_req, res, next) => {
  try {
    const items = await prisma.workType.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});
