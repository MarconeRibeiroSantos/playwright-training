import { Page, Locator, expect } from '@playwright/test';
import { getBaseUrl } from '@helpers/urls';
import { ProductRow } from '@pom/components/ProductRow';

export class ProductListPage {
  constructor(private readonly page: Page) {}

  // ==========================================
  // 1. Actions (Métodos de Domínio)
  // ==========================================

  static async navigate(page: Page): Promise<ProductListPage> {
    const baseUrl = getBaseUrl();
    await page.goto(`${baseUrl}/admin/listarprodutos`);
    return new ProductListPage(page);
  }

  /**
   * Deleta um produto pelo nome delegando a ação internamente para o ProductRow.
   * O spec nunca toca no botão de delete ou na linha da tabela diretamente.
   */
  async deleteProduct(productName: string): Promise<ProductListPage> {
    const row = this.row(productName);
    await row.clickDelete();
    return this;
  }

  // ==========================================
  // 2. Assertions
  // ==========================================

  async confirmProductListPage(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.table).toBeVisible();
  }

  async confirmProductListed(productName: string): Promise<void> {
    const row = this.row(productName);
    await row.confirmRowVisible();
  }

  async confirmProductNotListed(productName: string): Promise<void> {
    await expect(this.table.locator('tbody tr').filter({ hasText: productName })).toHaveCount(0);
  }

  // ==========================================
  // 3. Mechanics (Private Factories & Locators)
  // ==========================================

  private row(productName: string): ProductRow {
    const rowLocator = this.table.locator('tbody tr').filter({ hasText: productName });
    return new ProductRow(this.page, rowLocator);
  }

  private get heading(): Locator {
    return this.page.getByRole('heading', { name: /Lista dos Produtos/i });
  }

  private get table(): Locator {
    return this.page.locator('table');
  }
}
