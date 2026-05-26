import { expect, test } from '@playwright/test';

const worker = `Тестовый ${Date.now()}`;

test.describe('журнал работ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Журнал работ' })).toBeVisible();

    const workType = page.getByTestId('field-work-type');
    await expect(workType).toBeVisible();
    await expect(async () => {
      expect(await workType.locator('option').count()).toBeGreaterThan(1);
    }).toPass({ timeout: 15_000 });
  });

  test('добавить запись и увидеть в таблице', async ({ page }) => {
    await page.getByTestId('field-work-date').fill('2026-05-20');
    await page.getByTestId('field-work-type').selectOption({ index: 1 });
    await page.getByTestId('field-volume').fill('15');
    await page.getByTestId('field-unit').selectOption('м²');
    await page.getByTestId('field-worker').fill(worker);
    await page.getByTestId('submit-entry').click();

    await expect(page.getByTestId('entries-table')).toContainText(worker);
    await expect(page.getByTestId('entries-table')).toContainText('м²');
  });

  test('редактировать и удалить запись', async ({ page }) => {
    await page.getByTestId('field-work-date').fill('2026-05-21');
    await page.getByTestId('field-work-type').selectOption({ index: 2 });
    await page.getByTestId('field-volume').fill('3');
    await page.getByTestId('field-unit').selectOption('шт.');
    const name = `E2E ${Date.now()}`;
    await page.getByTestId('field-worker').fill(name);
    await page.getByTestId('submit-entry').click();
    await expect(page.getByTestId('entries-table')).toContainText(name);

    const row = page.locator('[data-testid="entry-row"]', { hasText: name });
    await row.getByTestId('edit-entry').click();
    await expect(page.getByRole('heading', { name: 'Правка записи' })).toBeVisible();

    const patched = `${name} (изм.)`;
    await page.getByTestId('field-worker').fill(patched);
    await page.getByTestId('submit-entry').click();
    await expect(page.getByTestId('entries-table')).toContainText(patched);

    page.once('dialog', (d) => d.accept());
    await page.locator('[data-testid="entry-row"]', { hasText: patched }).getByTestId('delete-entry').click();
    await expect(page.getByTestId('entries-table')).not.toContainText(patched);
  });

  test('валидация пустой формы', async ({ page }) => {
    await page.getByTestId('field-work-date').fill('');
    await page.getByTestId('field-volume').fill('');
    await page.getByTestId('field-worker').fill('');
    await page.getByTestId('submit-entry').click();
    await expect(page.getByTestId('field-work-date').locator('..').locator('.error')).toBeVisible();
  });
});
