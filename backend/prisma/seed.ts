import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const workTypes = [
  'Кладка перегородок',
  'Монтаж опалубки',
  'Армирование плиты',
  'Бетонирование фундамента',
  'Гидроизоляция',
  'Кровельные работы',
  'Штукатурные работы',
  'Электромонтаж',
];

async function main(): Promise<void> {
  for (const name of workTypes) {
    await prisma.workType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
