import { Page, Locator, expect } from '@playwright/test';

/**
 * Subcomponente de linha de tabela (Row Component).
 * Encapsula todo o escopo de uma linha individual da tabela de produtos.
 * Segue a Seção 4 do GEMINI.md.
 */
export class ProductRow {
  constructor(
    private readonly page: Page,
    private readonly row: Locator
  ) {}

  // ==========================================
  // Actions
  // ==========================================

  async clickDelete(): Promise<void> {
    await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes('/produtos') && (res.status() === 200 || res.status() === 400)
      ),
      this.deleteButton.click(),
    ]);
  }

  // ==========================================
  // Assertions
  // ==========================================

  async confirmRowVisible(): Promise<void> {
    await expect(this.row).toBeVisible();
  }

  async confirmPrice(expectedPrice: string | RegExp): Promise<void> {
    await expect(this.priceCell).toContainText(expectedPrice);
  }

  async confirmQuantity(expectedQuantity: string | RegExp): Promise<void> {
    await expect(this.quantityCell).toContainText(expectedQuantity);
  }

  // ==========================================
  // Mechanics
  // ==========================================

  private get deleteButton(): Locator {
    return this.row.getByRole('button', { name: /excluir/i });
  }

  private get priceCell(): Locator {
    return this.row.locator('td').nth(1);
  }

  private get quantityCell(): Locator {
    return this.row.locator('td').nth(3);
  }
}
